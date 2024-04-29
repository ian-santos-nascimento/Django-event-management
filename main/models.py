from django.db import models


# Create your models here.

class Comida(models.Model):
    id_comida = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)

    def __str__(self):
        return self.nome


class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    telefone = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class Comida_Evento(models.Model):
    id_comida = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    quantidade = models.IntegerField()

    def __str__(self):
        return self.nome


class Evento(models.Model):
    id_evento = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    observacao = models.TextField()
    comidas = models.ManyToManyField(Comida_Evento)
    qtd_dias_evento = models.IntegerField


class Terceiro(models.Model):
    id_terceiro = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)

    def __str__(self):
        return self.nome
