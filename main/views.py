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

from .models import Logistica, Orcamento, LogisticaOrcamento, Evento, Cliente, Comida
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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def saveOrcamento(request):
    evento_id = request.data.get('evento')
    cliente_id = request.data.get('cliente')
    logisticas = request.data.get('logisticas')
    nome_evento = request.data.get('nome')
    comidas = request.data.get('comidas')
    observacoes_evento = request.data.get('observacoes')
    valor_total_comidas = request.data.get('valor_total_comidas')
    desconto_total_comidas = request.data.get('desconto_total_comidas')
    valor_total_logisticas = request.data.get('valor_total_logisticas')
    desconto_total_logisticas = request.data.get('desconto_total_logisticas')

    try:
        evento = Evento.objects.get(pk=evento_id)
        cliente = Cliente.objects.get(pk=cliente_id)
    except (Evento.DoesNotExist, Cliente.DoesNotExist) as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    orcamento = Orcamento(
        evento=evento,
        cliente=cliente,
        nome=nome_evento,
        observacoes=observacoes_evento,
        valor_total_comidas=valor_total_comidas,
        valor_total_logisticas=valor_total_logisticas,
        valor_desconto_comidas=desconto_total_comidas,
        valor_desconto_logisticas=desconto_total_logisticas,
        valor_total=valor_total_logisticas + valor_total_comidas,
    )
    orcamento.save()

    for logistica in logisticas:
        try:
            logistica_bd = Logistica.objects.get(pk=logistica.get('id'))
            quantidade = logistica.get('quantidade', 1)
            valor = logistica_bd.valor

            orcamento.logisticas.add(logistica_bd, through_defaults={'quantidade': quantidade, 'valor': valor})
        except Logistica.DoesNotExist:
            continue
    for comida in comidas:
        try:
            comida_bd = Comida.objects.get(pk=comida.get('id'))
            quantidade = comida.get('quantidade', 1)
            valor = comida_bd.valor
            orcamento.comidas.add(comida_bd, through_defaults={'quantidade': quantidade, 'valor': valor})
        except Comida.DoesNotExist:
            continue
        except Exception as e:
            print('Exception while saving Orcamento:' + str(e))
    return Response({'message': 'Orcamento criado com sucesso', 'id': orcamento.id_orcamento},
                    status=status.HTTP_200_OK)


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
