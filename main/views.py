from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.messages import get_messages
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .forms import *
from .models import Comida
from .utils import csvConverter


@login_required(login_url='login')
def home(request):
    if request.method == 'POST':
        return evento_create_form(request)
    eventos = Evento.objects.only('nome', 'data_inicio', 'local', 'id_evento')
    return render(request, 'main/home.html', {'eventos': eventos})


@login_required(login_url='login')
def evento_create(request):
    if request.method == 'POST':
        form = CreateEventoForm(request.POST)
        terceiros_formset = form.terceiros(request.POST)
        if form.is_valid() and terceiros_formset.is_valid():
            evento = form.save(commit=False)
            comidas = criarComidasEvento(form)
            for comida_id, quantidade in comidas.items():
                comida = Comida.objects.get(pk=comida_id)
                evento.save()
                evento.comidas.add(comida, through_defaults={'valor': comida.valor, 'quantidade': quantidade})
            for terceiro_form in terceiros_formset:
                if terceiro_form.has_changed():
                    terceiro = terceiro_form.save()
                    TerceiroEvento.objects.create(id_terceiro=terceiro, id_evento=evento)
            messages.success(request, 'Evento salvo com sucesso!')
            return HttpResponseRedirect(reverse('home'))
        else:
            message_error(request, form if form.is_valid() else terceiros_formset )
            return render(request, 'eventos/novoEvento.html', {'form': form})
    else:
        return HttpResponseRedirect(reverse('home'))


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
    if request.method == 'GET':
        messages = get_messages(request)
        usuarios = User.objects.exclude(username='admin')
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
        clientes = Cliente.objects.all().order_by('nome')
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
            return render(request, 'comidas/novaComida.html', {'form': form})


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


def evento_create_form(request):
    form = CreateEventoForm()
    comidas = Comida.objects.all()
    terceiros_formset = form.terceiros()
    return render(request, 'eventos/novoEvento.html',
                  {'form': form, 'comidas': comidas, 'terceiros_formset': terceiros_formset})


def generate_registration_form(request):
    form = RegistrationForm()
    return render(request, 'usuarios/novoUsuario.html', {'form': form})


def cliente_create_form(request):
    form = CreateClientForm()
    endereco_form = EnderecoForm()
    return render(request, 'clientes/novoCliente.html', {'form': form, 'endereco_form': endereco_form})


def get_paginated_comidas(request):
    comidas_list = Comida.objects.all().order_by('nome')
    paginator = Paginator(comidas_list, 20)
    page = request.GET.get('page')
    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)


def get_paginated_locais(request):
    locais_list = LocalEvento.objects.all().order_by('id_local')
    paginator = Paginator(locais_list, 20)
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
