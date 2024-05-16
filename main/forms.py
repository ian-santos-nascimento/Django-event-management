from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User
from .models import *


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


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
        fields = ["nome", "telefone", "cidade"]
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