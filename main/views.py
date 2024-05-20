from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.messages import get_messages
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from .forms import *
from .models import Comida
from .utils import csvConverter


@login_required(login_url='login')
def home(request):
    if request.user.is_authenticated:
        return render(request, 'main/home.html')
    else:
        return render(request, 'registration/login.html')


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
        # Verifica se o formulário é para edição ou criação
        if 'saveEditCliente' in request.POST:
            # Se cliente_id estiver presente, é uma edição
            cliente_id = request.POST['clienteId']
            cliente = Cliente.objects.get(pk=cliente_id)
            form = CreateClientForm(request.POST, instance=cliente)
        else:
            # Senão, é uma criação de novo cliente
            form = CreateClientForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Cliente salvo com sucesso!')
            return HttpResponseRedirect(reverse('client_list'))
    else:
        form = CreateClientForm()

    return render(request, 'clientes/novoCliente.html', {'form': form})


@login_required(login_url='login')
def client_list(request):
    if request.method == 'POST':
        if 'editClient' in request.POST:
            client_id = request.POST.get('clienteId')
            client = Cliente.objects.get(pk=client_id)
            form = CreateClientForm(instance=client)
            return render(request, 'clientes/novoCliente.html', {'form': form, 'client_id': client_id})
        else:
            return generate_cliente_registration_form(request)
    elif request.method == 'GET':
        clientes = Cliente.objects.all()
        return render(request, 'clientes/clientes.html', {'clientes': clientes})


@login_required(login_url='login')
def comida_list(request):
    comidas = get_paginated_comidas(request)
    if request.method == 'POST':
        if is_file_upload(request):
            return handle_file_upload(request)
        else:
            return handle_comida(request)
    return render(request, 'comidas/comidas.html', {'comidas': comidas})


@login_required(login_url='login')
def comida_create(request):
    if request.method == 'POST':
        if 'saveEditCliente' in request.POST:
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


#
def generate_registration_form(request):
    form = RegistrationForm()
    return render(request, 'usuarios/novoUsuario.html', {'form': form})


def generate_cliente_registration_form(request):
    form = CreateClientForm()
    return render(request, 'clientes/novoCliente.html', {'form': form})


def get_paginated_comidas(request):
    comidas_list = Comida.objects.all()
    paginator = Paginator(comidas_list, 20)
    page = request.GET.get('page')

    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)


def is_file_upload(request):
    if 'file' in request.FILES:
        return True
    else:
        return False


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
