from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.messages import get_messages
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from .forms import *


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'message': 'Login successful'})
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=400)


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        data = request.data
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            login(request, user)
            return Response({"Login successful"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return JsonResponse({'message': 'Logout successful'})


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


def generate_registration_form(request):
    form = RegistrationForm()
    return render(request, 'usuarios/novoUsuario.html', {'form': form})
