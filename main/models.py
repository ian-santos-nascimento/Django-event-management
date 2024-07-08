from django.db import models

from .service import incluiAgravoRegiao
from .utils import listSelect


class Cidade(models.Model):
    id_cidade = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=300)
    estado = models.CharField(max_length=300, choices=listSelect.ESTADOS_BRASILEIROS)
    taxa_deslocamento = models.DecimalField(max_digits=5, decimal_places=2)
    excluida = models.BooleanField(default=False)

    @property
    def agravo_formatado(self) -> str:
        return "%.0f%%" % (self.taxa_deslocamento * 100)

    def __str__(self):
        return f"{self.nome}-{self.estado}"


class Endereco(models.Model):
    id_endereco = models.AutoField(primary_key=True)
    cep = models.CharField(max_length=20, unique=False)
    endereco = models.CharField(max_length=100, unique=False)
    bairro = models.CharField(max_length=100, unique=False)
    cidade = models.CharField(max_length=100, unique=False)
    estado = models.CharField(max_length=100, unique=False)
    numero = models.CharField(max_length=20, unique=False)
    complemento = models.CharField(max_length=200, unique=False)

    def __str__(self):
        return "{} - nª{} - {} - {}".format(self.endereco, self.numero, self.bairro, self.cidade)


class Comida(models.Model):
    comida_id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=400)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=8)
    quantidade_minima = models.IntegerField()
    tipo = models.CharField(max_length=200, choices=listSelect.TIPO_COMIDA)

    def __str__(self):
        comida = str(self.comida_id) + "-" + self.nome + " - " + "R$" + str(self.valor)
        return comida.replace('.', ',')

    @property
    def valor_formatado(self):
        valor_str = "R$" + str(self.valor)
        return valor_str.replace('.', ',')


class LocalEvento(models.Model):
    id_local = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    cidade = models.OneToOneField(Cidade, on_delete=models.DO_NOTHING)
    endereco = models.CharField(max_length=400, unique=False)
    telefone = models.CharField(max_length=20, unique=False)
    email = models.EmailField(unique=False)
    observacoes = models.TextField(null=True, blank=True)

    @property
    def telefone_formatado(self):
        # Verifica se o número de telefone possui 10 ou 11 dígitos
        if len(self.telefone) == 10:
            return f'({self.telefone[:2]}) {self.telefone[2:8]}-{self.telefone[8:]}'
        elif len(self.telefone) == 11:
            return f'({self.telefone[:2]}) {self.telefone[2:7]}-{self.telefone[7:]}'
        else:
            return self.telefone

    def __str__(self):
        return self.nome


class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    razao_social = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=200)
    inscricao_estadual = models.CharField(max_length=200)
    nome = models.CharField(max_length=200)
    telefone = models.CharField(max_length=100)
    endereco = models.OneToOneField(Endereco, on_delete=models.CASCADE, blank=True, null=True)
    prazo_pagamento = models.CharField()
    taxa_financeira = models.DecimalField(decimal_places=2, max_digits=8, blank=True, null=True)
    inicio_contrato = models.DateField(blank=True, null=True)
    fim_contrato = models.DateField(blank=True, null=True)

    @property
    def taxa_financeira_formatado(self) -> str:
        return "%.0f%%" % (self.taxa_financeira * 100)

    def save(self, *args, **kwargs):
        prazo_pagamento_value = int(self.prazo_pagamento.split()[0])
        meses = prazo_pagamento_value / 30 #Divide pra pegar o mes
        self.taxa_financeira = (meses * 0.03)  ## 3 é a taxa/mensal cobrada
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome

    @property
    def telefone_formatado(self):
        # Verifica se o número de telefone possui 10 ou 11 dígitos
        if len(self.telefone) == 10:
            return f'({self.telefone[:2]}) {self.telefone[2:8]}-{self.telefone[8:]}'
        elif len(self.telefone) == 11:
            return f'({self.telefone[:2]}) {self.telefone[2:7]}-{self.telefone[7:]}'
        else:
            return self.telefone


class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    codigo_evento = models.IntegerField(null=False, unique=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    observacao = models.TextField()
    comidas = models.ManyToManyField(Comida, through='ComidaEvento')
    clientes = models.ManyToManyField(Cliente, null=True)
    qtd_dias_evento = models.IntegerField(null=True, blank=True)
    local = models.ForeignKey(LocalEvento, on_delete=models.DO_NOTHING)
    qtd_pessoas = models.IntegerField(null=False, blank=False)
    data_inicio = models.DateField(null=True, blank=True)
    data_fim = models.DateField(null=True, blank=True)


class ComidaEvento(models.Model):
    comida = models.ForeignKey(Comida, on_delete=models.DO_NOTHING, default=1)
    evento = models.ForeignKey(Evento, on_delete=models.DO_NOTHING, default=1)
    valor = models.DecimalField(decimal_places=2, max_digits=8)
    quantidade = models.IntegerField()

    def __str__(self):
        return self.comida.nome


class LogisticaCidade(models.Model):
    id_logistica_cidade = models.AutoField(primary_key=True)
    cidade = models.ForeignKey(Cidade, on_delete=models.DO_NOTHING)
    hospedagem = models.DecimalField(decimal_places=2, max_digits=8)
    passagem = models.DecimalField(decimal_places=2, max_digits=8)
    frete = models.DecimalField(decimal_places=2, max_digits=8)


class Logistica(models.Model):
    id_logistica = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    dias = models.IntegerField()
    tipo = models.CharField(max_length=20, choices=listSelect.TIPO_LOGISTICA)
    in_sp = models.BooleanField(default=True)
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return self.nome


class Orcamento(models.Model):
    id_orcamento = models.AutoField(primary_key=True)
    evento = models.ForeignKey(Evento, related_name='orcamentos', on_delete=models.CASCADE)
    valor_total = models.DecimalField(decimal_places=2, max_digits=10)
