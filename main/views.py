from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .forms import RegistrationForm


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
        # Check username and password combination if correct
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return render(request, 'main/home.html')
        else:
            return render(request, 'registration/login.html',
                          {'error_message': 'Nome de usuário ou senha incorreto!'})
    else:
        return render(request, 'registration/login.html')


@login_required(redirect_field_name='redirect')
def user_create(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
    else:
        form = RegistrationForm()
    return render(request, 'main/novoUsuario.html', {'form': form})


@login_required(login_url='login')
def user_list(request):
    if request.method == 'POST':
        return render(request, 'main/novoUsuario.html')
    if request.method == 'GET':
        return render(request, 'main/usuarios.html')
