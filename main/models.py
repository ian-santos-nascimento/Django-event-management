from django.db import models
from .service import incluiAgravoRegiao


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
    id_comida = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=400)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    quantidade_minima = models.IntegerField()

    def __str__(self):
        return self.nome

    @property
    def valor_formatado(self):
        valor_str = "R$" + str(self.valor)
        return valor_str.replace('.', ',')


class ComidaEvento(models.Model):
    id_comida = models.ForeignKey('Comida', on_delete=models.DO_NOTHING)
    id_evento = models.ForeignKey('Evento', on_delete=models.DO_NOTHING)
    nome = models.CharField(max_length=400)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    quantidade = models.IntegerField()

    def __str__(self):
        return self.nome


class Terceiro(models.Model):
    id_terceiro = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)

    def __str__(self):
        return self.nome


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
        return self.endereco


class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    observacao = models.TextField()
    comidas = models.ManyToManyField(Comida, through='ComidaEvento')
    qtd_dias_evento = models.IntegerField
    terceiros = models.ManyToManyField(Terceiro, through='TerceiroEvento')
    local = models.ForeignKey(LocalEvento, on_delete=models.DO_NOTHING)


class TerceiroEvento(models.Model):
    id_terceiro = models.ForeignKey('Terceiro', on_delete=models.DO_NOTHING)
    id_evento = models.ForeignKey('Evento', on_delete=models.DO_NOTHING)


class Orcamento(models.Model):
    id_orcamento = models.AutoField(primary_key=True)
    evento_id = models.ForeignKey(Evento, on_delete=models.CASCADE)
    valor_total = models.DecimalField(decimal_places=2, max_digits=6)


class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    razao_social = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=200)
    inscricao_estadual = models.CharField(max_length=200)
    nome = models.CharField(max_length=200)
    telefone = models.CharField(max_length=100)
    evento_pk = models.ForeignKey(Evento, on_delete=models.DO_NOTHING, blank=True, null=True)
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
