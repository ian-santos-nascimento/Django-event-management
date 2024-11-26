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


class ComidaWithoutPaginationSerializer(serializers.ModelSerializer):
    valor = serializers.SerializerMethodField()

    class Meta:
        model = Comida
        fields = '__all__'

    def get_valor(self, obj):
        return obj.valor * obj.fator_multiplicador


class LocalEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalEvento
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('agravo', None)
        return data


class EventoSerializer(serializers.ModelSerializer):
    data_inicio = serializers.DateField(format='%d-%m-%Y', )
    data_fim = serializers.DateField(format='%d-%m-%Y', )
    qtd_dias_evento = serializers.SerializerMethodField()
    local = LocalEventoSerializer()

    class Meta:
        model = Evento
        fields = '__all__'

    def get_qtd_dias_evento(self, obj):
        return (obj.data_fim - obj.data_inicio).days + 1 if obj.data_inicio and obj.data_fim else 0


class LogisticaSerializar(serializers.ModelSerializer):
    class Meta:
        model = Logistica
        fields = '__all__'


class CidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cidade
        fields = '__all__'


class ComidaOrcamentoSerializer(serializers.ModelSerializer):
    comida_id = serializers.PrimaryKeyRelatedField(queryset=Comida.objects.all(), source='comida')

    class Meta:
        model = ComidaOrcamento
        fields = ['quantidade', 'valor', 'comida_id']

    def create(self, validated_data):
        # Remove `comida_id` de `validated_data` e obtenha a instância `Comida`
        comida_id = validated_data.pop('comida_id')
        validated_data['comida'] = Comida.objects.get(pk=comida_id)

        return ComidaOrcamento.objects.create(**validated_data)


class LogisticaOrcamentoSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(source='logistica', queryset=Logistica.objects.all())

    class Meta:
        model = LogisticaOrcamento
        fields = ['quantidade', 'valor', 'id']

    def create(self, validated_data):
        id = validated_data.pop('id')
        validated_data['logistica'] = Logistica.objects.get(pk=id)

        return LogisticaOrcamento.objects.create(**validated_data)


class ComidaOrcamentoListSerializer(serializers.ModelSerializer):
    comida = serializers.StringRelatedField()
    comida_id = serializers.IntegerField(source='comida.comida_id', read_only=True)

    class Meta:
        model = ComidaOrcamento
        fields = ['comida', 'quantidade', 'valor', 'comida_id']


class LogisticaOrcamentoListSerializer(serializers.ModelSerializer):
    logistica = serializers.StringRelatedField()
    id = serializers.IntegerField(source='logistica.id_logistica', read_only=True)

    class Meta:
        model = LogisticaOrcamento
        fields = ['logistica', 'quantidade', 'valor', 'id']


class OrcamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orcamento
        fields = '__all__'


class LogisticaCidadeSerializer(serializers.ModelSerializer):
    taxa_deslocamento = serializers.DecimalField(source='cidade.taxa_deslocamento', max_digits=5, decimal_places=2,
                                                 read_only=True)

    class Meta:
        model = LogisticaCidade
        fields = '__all__'


class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'


class ClienteEnderecoSerializer(serializers.ModelSerializer):
    inicio_contrato = serializers.DateField(format='%d-%m-%Y')
    fim_contrato = serializers.DateField(format='%d-%m-%Y')
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
    inicio_contrato = serializers.DateField(format='%d-%m-%Y', read_only=True)
    fim_contrato = serializers.DateField(format='%d-%m-%Y', read_only=True)

    class Meta:
        model = Cliente
        exclude = ['endereco']  # Exclua o campo 'endereco'


class DescontoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Desconto
        fields = ['tipo_comida', 'valor']


class EventoClienteSerializer(serializers.ModelSerializer):
    data_inicio = serializers.DateField(format='%d-%m-%Y', read_only=True)
    data_fim = serializers.DateField(format='%d-%m-%Y', read_only=True)
    clientes = ClienteSerializer(many=True)
    local = LocalEventoSerializer()

    class Meta:
        model = Evento
        fields = '__all__'


class OrcamentoUnicoSerializer(serializers.ModelSerializer):
    logisticas = serializers.SerializerMethodField()
    comidas = serializers.SerializerMethodField()
    cliente = ClienteSerializer()
    evento = EventoSerializer()
    descontos = serializers.SerializerMethodField()  # Altere para SerializerMethodField
    data_criacao = serializers.DateField(format='%d-%m-%Y', read_only=True)

    class Meta:
        model = Orcamento
        fields = '__all__'

    def update(self, instance, validated_data):
        validated_data.pop('id_orcamento', None)
        new_orcamento = Orcamento.objects.create(**validated_data)

        new_orcamento.comidas.set(instance.comidas.all())
        new_orcamento.logisticas.set(instance.logisticas.all())

        return new_orcamento

    def get_comidas(self, obj):
        comidas_orcamento = ComidaOrcamento.objects.filter(orcamento=obj)
        return ComidaOrcamentoListSerializer(comidas_orcamento, many=True).data

    def get_logisticas(self, obj):
        logisticas_orcamento = LogisticaOrcamento.objects.filter(orcamento=obj)
        return LogisticaOrcamentoListSerializer(logisticas_orcamento, many=True).data

    def get_descontos(self, obj):
        # Busca os descontos associados ao orçamento
        descontos = Desconto.objects.filter(orcamento=obj)
        return {desconto.tipo_comida: desconto.valor for desconto in descontos}


class OrcamentoSerializer(serializers.ModelSerializer):
    comidas_orcamento = ComidaOrcamentoSerializer(many=True)
    logisticas_orcamento = LogisticaOrcamentoSerializer(many=True)
    descontos = serializers.DictField()

    class Meta:
        model = Orcamento
        fields = [
            'id_orcamento', 'nome', 'status', 'observacoes', 'evento', 'cliente',
            'valor_total_comidas', 'valor_total_logisticas', 'valor_total',
            'valor_desconto_comidas', 'valor_desconto_logisticas', 'valor_imposto',
            'valor_decoracao', 'comidas_orcamento', 'logisticas_orcamento', 'descontos'
        ]

    def create(self, validated_data):
        comidas_data = validated_data.pop('comidas_orcamento', [])
        logisticas_data = validated_data.pop('logisticas_orcamento', [])
        descontos_data = validated_data.pop('descontos', {})

        orcamento = Orcamento.objects.create(**validated_data)
        for comida_data in comidas_data:
            ComidaOrcamento.objects.create(orcamento=orcamento, **comida_data)
        for logistica_data in logisticas_data:
            LogisticaOrcamento.objects.create(orcamento=orcamento, **logistica_data)
        for tipo_comida, valor in descontos_data.items():
            Desconto.objects.create(
                orcamento=orcamento,
                tipo_comida=tipo_comida,
                valor=valor
            )

        return orcamento

    def update(self, instance, validated_data):
        descontos_data = validated_data.pop('descontos', {})
        instance = super().update(instance, validated_data)
        for tipo_comida, valor in descontos_data.items():
            Desconto.objects.update_or_create(
                orcamento=instance,
                tipo_comida=tipo_comida,
                defaults={'valor': valor}
            )

        return instance
