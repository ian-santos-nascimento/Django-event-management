from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, HttpResponse
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from .document.generate_word_file import generate_orcamento_doc
from .forms import *
from .models import Orcamento
from .serializers import UserLoginSerializer, OrcamentoSerializer


def verificarOrcamentosDuplicados(orcamento):
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
    if duplicidade_response:
        return duplicidade_response
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Orçamento salvo com sucesso!'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, failed=AuthenticationFailed('Invalid credentials')):
        data = request.data
        serializer = UserLoginSerializer(data=data)
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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_word_orcamento(request, orcamento_id):
    document = generate_orcamento_doc(orcamento_id, request.data)
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    response['Content-Disposition'] = f'attachment; filename="orcamento_{orcamento_id}.docx"'
    document.save(response)
    return response
