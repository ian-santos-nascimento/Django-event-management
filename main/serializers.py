from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

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
    comidas = ComidaSerializer(many=True)

    class Meta:
        model = Evento
        fields = '__all__'

    def create(self, validated_data):
        comidas_data = validated_data.pop('comidas')
        evento = Evento.objects.create(**validated_data)
        for comida_data in comidas_data:
            comida = Comida.objects.get(pk=comida_data['comida_id'])
            ComidaEvento.objects.create(evento=evento, comida=comida, valor=comida.valor,
                                        quantidade=comida.quantidade_minima)
        return evento

class CidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cidade
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


class ClienteSerializer(serializers.ModelSerializer):
    endereco = EnderecoSerializer()  # Nested serializer for Endereco

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
                instance.endereco.update(**endereco_data)
            else:
                endereco = Endereco.objects.create(**endereco_data)
                instance.endereco = endereco
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
