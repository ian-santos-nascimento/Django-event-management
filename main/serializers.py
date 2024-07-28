from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import *

UserModel = get_user_model()


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def check_user(self, clean_data):
        user = authenticate(username=clean_data['username'], password=clean_data['password'])
        if not user:
            raise ValidationError('Username or password is incorrect')
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('email', 'username')


class ComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = '__all__'


class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'


class LogisticaSerializar(serializers.ModelSerializer):
    class Meta:
        model = Logistica
        fields = '__all__'


class CidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cidade
        fields = '__all__'


class ComidaOrcamentoSerializer(serializers.ModelSerializer):
    comida = serializers.StringRelatedField()

    class Meta:
        model = ComidaOrcamento
        fields = ['comida', 'quantidade', 'valor']


class OrcamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orcamento
        fields = '__all__'


class LogisticaCidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogisticaCidade
        fields = '__all__'


class LocalEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalEvento
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('agravo', None)
        return data


class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'


class ClienteEnderecoSerializer(serializers.ModelSerializer):
    endereco = EnderecoSerializer()

    class Meta:
        model = Cliente
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data

    def create(self, validated_data):
        endereco_data = validated_data.pop('endereco')
        endereco = Endereco.objects.create(**endereco_data)
        cliente = Cliente.objects.create(endereco=endereco, **validated_data)
        return cliente

    def update(self, instance, validated_data):
        endereco_data = validated_data.pop('endereco', None)
        if endereco_data:
            if instance.endereco:
                # Atualizar cada campo do endereço manualmente
                for attr, value in endereco_data.items():
                    setattr(instance.endereco, attr, value)
                instance.endereco.save()
            else:
                # Criar novo endereço se não existir
                endereco = Endereco.objects.create(**endereco_data)
                instance.endereco = endereco
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        exclude = ['endereco']  # Exclua o campo 'endereco'


class EventoClienteSerializer(serializers.ModelSerializer):
    clientes = ClienteSerializer(many=True)
    local = LocalEventoSerializer()

    class Meta:
        model = Evento
        fields = '__all__'


class OrcamentoUnicoSerializer(serializers.ModelSerializer):
    logisticas = LogisticaSerializar(many=True)
    comidas = serializers.SerializerMethodField()
    cliente = ClienteSerializer()
    evento = EventoSerializer()

    class Meta:
        model = Orcamento
        fields = '__all__'

    def get_comidas(self, obj):
        comidas_orcamento = ComidaOrcamento.objects.filter(orcamento=obj)
        return ComidaOrcamentoSerializer(comidas_orcamento, many=True).data
