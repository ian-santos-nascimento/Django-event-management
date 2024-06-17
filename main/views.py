from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.messages import get_messages
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.forms import formset_factory
from decimal import Decimal

from .forms import *
from .models import Comida
from .utils import csvConverter


@login_required(login_url='login')
def home(request):
    if request.method == 'POST':
        return evento_create_form(request)
    eventos = get_paginated_eventos(request)
    return render(request, 'main/home.html', {'eventos': eventos})


@login_required(login_url='login')
def evento_create(request):
    if request.method == 'POST':
        form = CreateEventoForm(request.POST)
        logistica_formset = formset_factory(CreateLogisticaForm, formset=CreateLogisticaFormSet,
                                            extra=request.POST['logistica-TOTAL_FORMS'], )
        logistica_forms = logistica_formset(request.POST, prefix='logistica')
        print(request.POST)
        if form.is_valid() and logistica_forms.is_valid():
            saveEvento(form, logistica_forms)
            messages.success(request, 'Evento salvo com sucesso!')
            return HttpResponseRedirect(reverse('home'))
        else:
            message_error(request, form if logistica_forms.is_valid() else logistica_forms)
            return render(request, 'eventos/novoEvento.html', {'form': form, 'logistica_formset': logistica_forms})
    else:
        evento_create_form(request)


def user_login(request):
    if request.method == 'POST':
        # Process the request if posted data are available
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('home'))
        else:
            return render(request, 'registration/login.html',
                          {'error_message': 'Nome de usuário ou senha incorreto!'})
    else:
        return render(request, 'registration/login.html')


@login_required(redirect_field_name='redirect')
def user_create(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Usuário salvo com sucesso!')
            return HttpResponseRedirect(reverse('user_list'))
        else:
            return render(request, 'usuarios/novoUsuario.html', {'form': form})
    form = RegistrationForm()
    return render(request, 'usuarios/novoUsuario.html', {'form': form})


@login_required(login_url='login')
def user_list(request):
    if request.method == 'POST' and 'editUser' in request.POST:
        user = User.objects.get(pk=request.POST['userId'])
        form = EditUserForm(instance=user)
        return render(request, 'usuarios/editarUsuario.html', {'form': form})
    elif request.method == 'POST':
        return generate_registration_form(request)
    messages = get_messages(request)
    usuarios = get_paginated_usuarios(request)
    return render(request, 'usuarios/usuarios.html', {'usuarios': usuarios, 'messages': messages})


@login_required(redirect_field_name='login')
def client_create(request):
    if request.method == 'POST':
        if 'saveEditCliente' in request.POST:  ##edição cliente
            cliente_id = request.POST['clienteId']
            cliente = Cliente.objects.get(pk=cliente_id)
            endereco = Endereco.objects.get(pk=cliente.endereco.id_endereco)
            form = CreateClientForm(request.POST, instance=cliente)
            form_endereco = EnderecoForm(request.POST, instance=endereco)
        else:  ##Novo cliente
            form = CreateClientForm(request.POST)
            form_endereco = EnderecoForm(request.POST)

        if form.is_valid() and form_endereco.is_valid():
            form.save(commit=False)
            form_endereco.save()
            form.endereco = form_endereco
            form.save()
            messages.success(request, 'Cliente salvo com sucesso!')
            return HttpResponseRedirect(reverse('client_list'))
        else:
            message_error(request, form)
            return render(request, 'clientes/novoCliente.html', {'form': form})
    else:
        return HttpResponseRedirect(reverse('client_list'))


@login_required(login_url='login')
def client_list(request):
    if request.method == 'POST':
        return handle_cliente_post(request)
    elif request.method == 'GET':
        clientes = get_paginated_clientes(request)
        return render(request, 'clientes/clientes.html', {'clientes': clientes})


@login_required(login_url='login')
def comida_list(request):
    comidas = get_paginated_comidas(request)
    if request.method == 'POST':
        if 'file' in request.FILES:
            return handle_file_upload(request)
        else:
            return handle_comida(request)
    return render(request, 'comidas/comidas.html', {'comidas': comidas})


@login_required(login_url='login')
def comida_create(request):
    if request.method == 'POST':
        if 'saveEditComida' in request.POST:
            comida_id = request.POST.get('comidaId')
            comida = Comida.objects.get(pk=comida_id)
            form = CreateComidaForm(request.POST, instance=comida)
        else:
            form = CreateComidaForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Comida salva com sucesso!')
            return HttpResponseRedirect(reverse('comida_list'))
        else:
            evento_create_form(request, form)


@login_required(login_url='login')
def local_list(request):
    locais = get_paginated_locais(request)
    if request.method == 'POST':
        return handle_local_post(request)
    else:
        return render(request, 'locais/locais.html', {'locais': locais})


@login_required(login_url='login')
def local_create(request):
    if 'saveEditLocal' in request.POST:
        local_id = request.POST.get('localId')
        local = LocalEvento.objects.get(pk=local_id)
        endereco = Endereco.objects.get(pk=local.endereco.id_endereco)
        form_local = CreateLocalEventoForm(request.POST, instance=local)
        form_endereco = EnderecoForm(request.POST, instance=endereco)
    else:
        form_local = CreateLocalEventoForm(request.POST)
        form_endereco = EnderecoForm(request.POST)
    if form_local.is_valid() and form_endereco.is_valid():
        endereco = form_endereco.save()
        local_evento = form_local.save(commit=False)
        local_evento.endereco = endereco
        local_evento.save()
        messages.success(request, 'Local salvo com sucesso!')
    return HttpResponseRedirect(reverse('local_list'))


def saveEvento(form, logistica_forms):
    evento = form.save(commit=False)
    evento.save()
    comidas = criarComidasEvento(form)
    logisticas = [logistica.save(commit=False) for logistica in logistica_forms]
    evento = Evento.objects.get(pk=evento.id_evento)
    evento.comidas.set([])
    for comida_id, quantidade in comidas.items():
        comida = Comida.objects.get(pk=comida_id)
        quantidade_comida = quantidade if quantidade > comida.quantidade_minima else comida.quantidade_minima
        ComidaEvento.objects.create(evento=evento, comida=comida, quantidade=quantidade_comida, valor=comida.valor)
    create_orcamento(evento, logisticas, )
    for logistica in logisticas:
        logistica.evento = evento
        logistica.save()


def handle_cliente_post(request):
    if 'editClient' in request.POST:
        client_id = request.POST.get('clienteId')
        client = Cliente.objects.get(pk=client_id)
        form = CreateClientForm(instance=client)
        endereco_form = EnderecoForm(instance=client.endereco)
        return render(request, 'clientes/novoCliente.html',
                      {'form': form, 'client_id': client_id, 'endereco_form': endereco_form})
    else:
        return cliente_create_form(request)


def handle_local_post(request):
    if request.method == 'POST' and 'editlocal' in request.POST:
        local_id = request.POST.get('localId')
        local = LocalEvento.objects.get(pk=local_id)
        form = CreateLocalEventoForm(instance=local)
        form_endereco = EnderecoForm(instance=local.endereco)
        return render(request, 'locais/novoLocal.html',
                      {'form': form, 'formEndereco': form_endereco, 'local_id': local_id})
    else:
        form = CreateLocalEventoForm()
        form_endereco = EnderecoForm()
        return render(request, 'locais/novoLocal.html', {'form': form, 'formEndereco': form_endereco})


def evento_create_form(request, evento_form=None, ):
    if evento_form:
        form = CreateEventoForm(request.POST, instance=evento_form)
    else:
        form = CreateEventoForm()
    logistica_formset = CreateLogisticaFormSet(queryset=Logistica.objects.none(), prefix='logistica')
    comidas = Comida.objects.all()
    return render(request, 'eventos/novoEvento.html',
                  {'form': form, 'comidas': comidas, 'logistica_formset': logistica_formset})


def generate_registration_form(request):
    form = RegistrationForm()
    return render(request, 'usuarios/novoUsuario.html', {'form': form})


def cliente_create_form(request):
    form = CreateClientForm()
    endereco_form = EnderecoForm()
    return render(request, 'clientes/novoCliente.html', {'form': form, 'endereco_form': endereco_form})


def get_paginated_usuarios(request):
    usuarios = User.objects.exclude(username='admin').order_by('username')
    return generic_paginator(request, usuarios)


def get_paginated_clientes(request):
    clientes_list = Cliente.objects.all().order_by('nome')
    return generic_paginator(request, clientes_list)


def get_paginated_eventos(request):
    evento_list = Evento.objects.only('nome', 'data_inicio', 'local', 'id_evento').order_by('data_inicio')
    return generic_paginator(request, evento_list)


def get_paginated_comidas(request):
    comidas_list = Comida.objects.all().order_by('nome')
    return generic_paginator(request, comidas_list)


def get_paginated_locais(request):
    locais_list = LocalEvento.objects.all().order_by('id_local')
    return generic_paginator(request, locais_list)


def generic_paginator(request, object_list):
    paginator = Paginator(object_list, 20)
    page = request.GET.get('page')

    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)


def handle_file_upload(request):
    file = request.FILES['file']
    if 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' not in file.content_type:
        messages.error(request, 'Formato inválido! Faça upload apenas de arquivos csv')
        return HttpResponseRedirect(reverse('comida_list'))

    csvConverter.createComidaFromCsv(file=file)
    messages.success(request, 'Upload realizado com sucesso!')
    return HttpResponseRedirect(reverse('comida_list'))


def handle_comida(request):
    if 'editComida' in request.POST:
        comida_id = request.POST.get('comidaId')
        comida = Comida.objects.get(pk=comida_id)
        form = CreateComidaForm(instance=comida)
        return render(request, 'comidas/novaComida.html', {'form': form, 'comida_id': comida_id})

    if 'comidaId' in request.POST:
        form = CreateComidaForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Comida editada com sucesso!')
        return HttpResponseRedirect(reverse('comida_list'))

    form = CreateComidaForm()
    return render(request, 'comidas/novaComida.html', {'form': form})


def criarComidasEvento(post):
    comidas = {}
    for key, value in post.data.items():
        if key.startswith('quantidade'):
            comida_id = key.split('-')[1]
            comidas[comida_id] = int(value)
    return comidas


def message_error(request, form):
    error_message = ""
    for field, errors in form.errors.items():
        error_message += f"{field}: {', '.join(errors)}<br>"
    messages.error(request, error_message)


def create_orcamento(evento, logisticas):
    valor_total = Decimal()
    for comida_evento in ComidaEvento.objects.filter(evento=evento):
        valor_total += Decimal(comida_evento.valor) * Decimal(comida_evento.quantidade)
    for logistica in logisticas:
        valor_total += logistica.valor * logistica.dias
    Orcamento.objects.create(evento_id=evento, valor_total=valor_total)
