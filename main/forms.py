from django import forms
from django.forms import modelformset_factory
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
            'cep': forms.TextInput(attrs={
                'placeholder': "XXXXX-XXX",
                'data-mask': "00000-000"
            }),
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
        fields = ['nome', 'telefone', 'email', 'observacoes', 'endereco']
        exclude = ['endereco', 'agravo']
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'telefone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'observacoes': forms.Textarea(attrs={'class': 'form-control'}),
        }


class CreateLogisticaForm(forms.ModelForm):
    class Meta:
        model = Logistica
        fields = '__all__'
        exclude = ['evento']
        widgets = {
            'tipo': forms.Select(),
        }
        labels = {
            'valor': "Valor diária",
            'dias': "Qtd dias"
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.empty_permitted = True


class LogisticaFormEvento(forms.ModelForm):
    evento = forms.ModelChoiceField(
        queryset=Evento.objects.all().only('nome').order_by('nome'),
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Logistica
        fields = '__all__'
        exclude = ['id_logistica']
        widgets = {
            'tipo': forms.Select(),
        }
        labels = {
            'valor': "Valor diária",
            'dias': "Qtd dias"
        }


class CreateEventoForm(forms.ModelForm):
    local = forms.ModelChoiceField(queryset=LocalEvento.objects.all().only('nome').order_by('nome'),
                                   widget=forms.Select(attrs={'class': 'form-control'}))

    data_inicio = forms.DateField(widget=forms.SelectDateWidget(attrs={'class': 'mt-3 mb-3 col-3'}))
    data_fim = forms.DateField(widget=forms.SelectDateWidget(attrs={'class': 'mt-3 mb-3 col-3'}))
    cliente = forms.ModelChoiceField(queryset=Cliente.objects.all().only('nome').order_by('nome'),
                                     label='Cliente',
                                     widget=forms.Select(attrs={'class': 'form-control'}))

    class Meta:
        model = Evento
        exclude = ['id_evento']
        fields = ['nome', 'descricao', 'observacao', 'comidas', 'data_inicio', 'local', 'cliente',
                  'data_fim', 'cliente']
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'descricao': forms.Textarea(attrs={'class': 'form-control', 'style': 'height: 200px;'}),
            'observacao': forms.Textarea(attrs={'class': 'form-control', 'style': 'height: 200px;'}),
            'qtd_dias_evento': forms.NumberInput(attrs={'class': 'form-control'}),
        }


CreateLogisticaFormSet = modelformset_factory(Logistica, form=CreateLogisticaForm, extra=1, can_delete=True,
                                              can_delete_extra=True)


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
        fields = ["nome", "telefone", "razao_social", 'cnpj', 'inscricao_estadual', 'endereco']
        exclude = ["endereco"]
        widgets = {'telefone': forms.TextInput(attrs={'placeholder': "(00)00000-0000", 'data-mask': "(00) 0000-0000"}),
                   'cnpj': forms.TextInput(
                       attrs={'placeholder': "12.345.678/0000-00", 'data-mask': "00.000.000/0000-00"})}


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
