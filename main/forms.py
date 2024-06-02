from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User
from .models import Endereco,LocalEvento,Evento,Comida, Cliente, Terceiro
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
        fields = ['nome', 'telefone', 'email', 'observacoes', 'endereco']
        exclude = ['endereco','agravo']
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'telefone': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'observacoes': forms.Textarea(attrs={'class': 'form-control'}),
        }


class ComidaQuantidadeForm(forms.Form):
    comida = forms.ModelMultipleChoiceField(queryset=Comida.objects.all().order_by('nome'))
    quantidade = forms.IntegerField(widget=forms.NumberInput(attrs={'min': 1}), min_value=1)


class CreateEventoForm(forms.ModelForm):
    local = forms.ModelChoiceField(queryset=LocalEvento.objects.all().only('nome').order_by('nome'),
                                   widget=forms.Select(attrs={'class': 'form-control mt-3'}))
    comidas = forms.ModelMultipleChoiceField(queryset=Comida.objects.all().order_by('nome'),
                                             widget=forms.CheckboxSelectMultiple(attrs={'style': 'overflow-y: scroll'}))
    data_inicio = forms.DateField(widget=forms.SelectDateWidget(attrs={'class': 'mt-3 mb-3 col-3'}))
    data_fim = forms.DateField(widget=forms.SelectDateWidget(attrs={'class': 'mt-3 mb-3 col-3'}))
    cliente = forms.ModelChoiceField(queryset=Cliente.objects.all().only('nome').order_by('nome'),
                                     label='Cliente',
                                     widget=forms.Select(attrs={'class': 'form-control mt-3'}))

    class Meta:
        model = Evento
        exclude = ['id_evento']
        fields = ['nome', 'descricao', 'observacao', 'qtd_dias_evento', 'comidas', 'data_inicio', 'local', 'cliente',
                  'data_fim']
        widgets = {
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'descricao': forms.Textarea(attrs={'class': 'form-control', 'style': 'height: 200px;'}),
            'observacao': forms.Textarea(attrs={'class': 'form-control', 'style': 'height: 200px;'}),
            'qtd_dias_evento': forms.NumberInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.comida_forms = []
        for comida in Comida.objects.all():
            comida_form = ComidaQuantidadeForm(initial={'comida': comida})
            self.comida_forms.append(comida_form)



class CreateTerceiroForm(forms.ModelForm):
    class Meta:
        model = Terceiro
        fields = '__all__'
        exclude = ['id_terceiro']


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
