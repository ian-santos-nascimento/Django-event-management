from django.db import models


class Comida(models.Model):
    id_comida = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)

    def __str__(self):
        return self.nome


class ComidaEvento(models.Model):
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
    comidas = models.ManyToManyField(ComidaEvento)
    qtd_dias_evento = models.IntegerField


class Terceiro(models.Model):
    id_terceiro = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)

    def __str__(self):
        return self.nome


class Orcamento(models.Model):
    id_orcamento = models.AutoField(primary_key=True)
    evento_id = models.ForeignKey(Evento, on_delete=models.CASCADE)
    valor_total = models.DecimalField(decimal_places=2, max_digits=6)


class Cliente(models.Model):
    id_cliente = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    telefone = models.CharField(max_length=100)
    evento_pk = models.ForeignKey(Evento, on_delete=models.DO_NOTHING, blank=True, null=True)
    cidade = models.CharField(max_length=200)

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

class CardapioUpload(models.Model):
    file = models.FileField(upload_to='uploads')