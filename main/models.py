from django.db import models
from .service import incluiAgravoRegiao
from .utils import listSelect


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
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    quantidade_minima = models.IntegerField()

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
    endereco = models.ForeignKey(Endereco, on_delete=models.DO_NOTHING)
    agravo = models.DecimalField(decimal_places=2, max_digits=6)
    telefone = models.CharField(max_length=20, unique=False)
    email = models.EmailField(unique=False)
    observacoes = models.TextField(null=True, blank=True)

    @property
    def agravo_formatado(self) -> str:
        return "%.0f%%" % (self.agravo * 100)

    def save(self):
        if self.agravo is None:
            incluiAgravoRegiao(self)
        super(LocalEvento, self).save()

    @property
    def telefone_formatado(self):
        # Verifica se o número de telefone possui 10 ou 11 dígitos
        if len(self.telefone) == 10:
            return f'({self.telefone[:2]}) {self.telefone[2:6]}-{self.telefone[6:]}'
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

    def __str__(self):
        return self.nome

    @property
    def telefone_formatado(self):
        # Verifica se o número de telefone possui 10 ou 11 dígitos
        if len(self.telefone) == 10:
            return f'({self.telefone[:2]}) {self.telefone[2:6]}-{self.telefone[6:]}'
        elif len(self.telefone) == 11:
            return f'({self.telefone[:2]}) {self.telefone[2:7]}-{self.telefone[7:]}'
        else:
            return self.telefone


class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    observacao = models.TextField()
    comidas = models.ManyToManyField(Comida, through='ComidaEvento')
    qtd_dias_evento = models.IntegerField(null=True, blank=True)
    local = models.ForeignKey(LocalEvento, on_delete=models.DO_NOTHING)
    data_inicio = models.DateField(null=True, blank=True)
    data_fim = models.DateField(null=True, blank=True)
    data_criacao = models.DateField(auto_now_add=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.DO_NOTHING)

    def save(self):
        dias = self.data_fim - self.data_inicio
        self.qtd_dias_evento = dias.days
        super(Evento, self).save()

    def __str__(self):
        return self.nome


class Logistica(models.Model):
    id_logistica = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    dias = models.IntegerField()
    tipo = models.CharField(max_length=20, choices=listSelect.TIPO_LOGISTICA)
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return self.nome


class Orcamento(models.Model):
    id_orcamento = models.AutoField(primary_key=True)
    evento = models.ForeignKey(Evento, related_name='orcamentos', on_delete=models.CASCADE)
    valor_total = models.DecimalField(decimal_places=2, max_digits=10)


class ComidaEvento(models.Model):
    comida = models.ForeignKey(Comida, on_delete=models.DO_NOTHING, )
    evento = models.ForeignKey(Evento, on_delete=models.DO_NOTHING, )
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    quantidade = models.IntegerField()

    def __str__(self):
        return f'{self.comida.nome} - {self.evento.nome}'
