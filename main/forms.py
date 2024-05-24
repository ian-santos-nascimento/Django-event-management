from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User
from .models import *
from .utils.listSelect import ESTADOS_BRASILEIROS


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


class EnderecoForm(forms.ModelForm):
    estado = forms.ChoiceField(choices=ESTADOS_BRASILEIROS, label="Estado")

    class Meta:
        model = Endereco
        fields = '__all__'
        exclude = ['id_endereco']
        widgets = {
            'cep': forms.TextInput(attrs={'class': 'form-control'}),
            'endereco': forms.TextInput(attrs={'class': 'form-control'}),
            'bairro': forms.TextInput(attrs={'class': 'form-control'}),
            'cidade': forms.TextInput(attrs={'class': 'form-control'}),
            'numero': forms.TextInput(attrs={'class': 'form-control'}),
            'complemento': forms.TextInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'cidade': 'Cidade(Caso seja São Paulo capital, digite exatamente assim "São Paulo")',
        }


class CreateLocalEventoForm(forms.ModelForm):
    class Meta:
        model = LocalEvento
        fields = ['nome', 'telefone', 'email', 'observacoes']
        exclude = ['endereco', 'agravo']
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'telefone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'observacoes': forms.Textarea(attrs={'class': 'form-control'}),
        }


class CreateEventoForm(forms.ModelForm):
    nome_local = forms.CharField(max_length=200, label='Nome do local', required=False)
    id_local = forms.IntegerField(widget=forms.HiddenInput(), required=False)

    class Meta:
        model = Evento
        exclude = ['id_evento']
        fields = '__all__'
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'descricao': forms.Textarea(attrs={'class': 'form-control'}),
            'observacao': forms.Textarea(attrs={'class': 'form-control'}),
        }


class EditUserForm(UserChangeForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
        }


class CreateClientForm(forms.ModelForm):
    class Meta:
        model = Cliente
        fields = ["nome", "telefone", "razao_social", 'cnpj', 'endereco', 'inscricao_estadual']
        widgets = {'telefone': forms.TextInput(attrs={'placeholder': "(00)00000-0000", 'data-mask': "(00) 0000-0000"})}


class CreateComidaForm(forms.ModelForm):
    class Meta:
        model = Comida
        fields = ['nome', 'descricao', 'valor', 'quantidade_minima']
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'descricao': forms.Textarea(attrs={'class': 'form-control'}),
            'valor': forms.NumberInput(attrs={'class': 'form-control'}),
            'quantidade_minima': forms.NumberInput(attrs={'class': 'form-control'}),
        }
