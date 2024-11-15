from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.messages import get_messages
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from .forms import *
from .models import Logistica, Orcamento, Evento, Cliente, Comida, ComidaOrcamento
from .serializers import UserLoginSerializer, OrcamentoSerializer


def verificarOrcamentosDuplicados(orcamento):
    # Verifica se já existe um orçamento com o mesmo evento, cliente e status
    orcamentos = Orcamento.objects.filter(
        evento_id=orcamento.evento,
        cliente_id=orcamento.cliente,
        status=orcamento.status
    )

    if orcamentos.exists():
        return JsonResponse({'status': 'Já existe um orçamento com o mesmo status, evento e cliente.'},
                            status=status.HTTP_409_CONFLICT)

    return None

@ensure_csrf_cookie
def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def saveOrcamento(request):
    serializer = OrcamentoSerializer(data=request.data)

    # Verifica duplicidade antes de salvar
    orcamento_instance = Orcamento(
        nome=request.data.get('nome'),
        cliente_id=request.data.get('cliente'),
        evento_id=request.data.get('evento'),
        status=request.data.get('status'),
    )
    duplicidade_response = verificarOrcamentosDuplicados(orcamento_instance)
    print(duplicidade_response)
    if duplicidade_response:
        return duplicidade_response  # Retorna erro se houver duplicidade

    # Verifica e salva os dados usando o serializer
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Orçamento salvo com sucesso!'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, failed=AuthenticationFailed('Invalid credentials')):
        data = request.data
        serializer = UserLoginSerializer(data=data)
        print("LOGIN")
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            if user is None:
                raise failed

            login(request, user)
            return Response({"message": "Login successful"}, status=status.HTTP_200_OK)


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


def create_comida_for_orcamento(request, orcamento):
    comidas = request.data.get('comidas')
    for comida in comidas:
        try:
            comida_bd = Comida.objects.get(pk=comida.get('comida_id'))
            quantidade = comida.get('quantidade', 1)
            valor = comida_bd.valor
            ComidaOrcamento.objects.create(
                orcamento=orcamento,
                comida=comida_bd,
                quantidade=quantidade,
                valor=valor
            )
        except Comida.DoesNotExist:
            continue
        except Exception as e:
            print('Exception ao salvar Comida para Orcamento:' + str(e))
            return Response('Houve um erro ao salvar a comida', status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def create_logistica_for_orcamento(request, orcamento):
    logisticas = request.data.get('logisticas')
    for logistica in logisticas:
        try:
            logistica_bd = Logistica.objects.get(pk=logistica.get('id'))
            quantidade = logistica.get('quantidade', 1)
            valor = logistica_bd.valor

            orcamento.logisticas.add(logistica_bd, through_defaults={'quantidade': quantidade, 'valor': valor})
        except Logistica.DoesNotExist:
            continue
        except Exception as e:
            print('Exception ao salvar Logistica para Orcamento:' + str(e))
            return Response('Houve um erro ao salvar a logistica', status=status.HTTP_500_INTERNAL_SERVER_ERROR)
