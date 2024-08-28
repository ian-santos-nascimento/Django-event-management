from django.db import models

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
    descricao = models.TextField(blank=True, null=True)
    valor = models.DecimalField(decimal_places=2, max_digits=8, default=0)
    quantidade_minima = models.IntegerField()
    tipo = models.CharField(max_length=200)
    subtipo = models.CharField(max_length=200, blank=True, null=True)

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
    cidade = models.OneToOneField(Cidade, on_delete=models.CASCADE)
    endereco = models.CharField(max_length=400, unique=False)
    telefone = models.CharField(max_length=20, unique=False)
    email = models.EmailField(unique=False)
    observacoes = models.TextField(null=True, blank=True)
    excluida = models.BooleanField(default=False)

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
    observacao = models.TextField()
    email = models.EmailField(max_length=200)
    telefone = models.CharField(max_length=100)
    endereco = models.OneToOneField(Endereco, on_delete=models.SET_NULL, blank=True, null=True)
    prazo_pagamento = models.CharField()
    taxa_financeira = models.DecimalField(decimal_places=2, max_digits=8, blank=True, null=True)
    inicio_contrato = models.DateField(blank=True, null=True)
    fim_contrato = models.DateField(blank=True, null=True)

    @property
    def taxa_financeira_formatado(self) -> str:
        return "%.0f%%" % (self.taxa_financeira * 100)

    def save(self, *args, **kwargs):
        prazo_pagamento_value = int(self.prazo_pagamento.split()[0])
        meses = prazo_pagamento_value / 30  # Divide pra pegar o mes
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
    tipo = models.CharField(max_length=100)
    descricao = models.TextField()
    observacao = models.TextField()
    clientes = models.ManyToManyField(Cliente)
    qtd_dias_evento = models.IntegerField(null=True, blank=True)
    local = models.ForeignKey(LocalEvento, on_delete=models.DO_NOTHING)
    qtd_pessoas = models.IntegerField(null=False, blank=False)
    data_inicio = models.DateField(null=True, blank=True)
    data_fim = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.qtd_dias_evento = abs((self.data_fim- self.data_inicio).days) + 1
        super().save(*args, **kwargs)



class LogisticaCidade(models.Model):
    id_logistica_cidade = models.AutoField(primary_key=True)
    cidade = models.ForeignKey(Cidade, on_delete=models.CASCADE)
    hospedagem = models.DecimalField(decimal_places=2, max_digits=8)
    passagem = models.DecimalField(decimal_places=2, max_digits=8)
    alimentacao = models.DecimalField(decimal_places=2, max_digits=8)
    frete_terceiros = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)
    frete_proprio = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)
    frete_proprio_intervalo = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)
    frete_proprio_completo = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)
    diaria_completo = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)
    diaria_simples = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)
    logistica_lanches = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)
    logistica_lanches_grande = models.DecimalField(decimal_places=2, max_digits=8, default=0.0)


class Logistica(models.Model):
    id_logistica = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    valor = models.DecimalField(decimal_places=2, max_digits=6)
    tipo = models.CharField(max_length=20)
    in_sp = models.BooleanField(default=True)
    excluida = models.BooleanField(default=False)

    def __str__(self):
        return self.nome


class Orcamento(models.Model):
    id_orcamento = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=200)
    status = models.CharField(max_length=200)
    data_alteracao = models.DateField(blank=True, null=True, auto_now=True)
    observacoes = models.TextField(max_length=2000)
    evento = models.ForeignKey(Evento, related_name='evento', on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, related_name='cliente', on_delete=models.CASCADE)
    comidas = models.ManyToManyField(Comida, through='ComidaOrcamento')
    logisticas = models.ManyToManyField(Logistica, through='LogisticaOrcamento')
    valor_total = models.DecimalField(decimal_places=2, max_digits=10)
    valor_total_logisticas = models.DecimalField(decimal_places=2, max_digits=10, null=True, blank=True)
    valor_total_comidas = models.DecimalField(decimal_places=2, max_digits=10, null=True, blank=True)
    valor_desconto_logisticas = models.DecimalField(decimal_places=2, max_digits=10, null=True, blank=True)
    valor_desconto_comidas = models.DecimalField(decimal_places=2, max_digits=10,null=True, blank=True)
    valor_imposto = models.DecimalField(decimal_places=2, max_digits=10,null=True, blank=True)
    valor_decoracao = models.DecimalField(decimal_places=2, max_digits=10,null=True, blank=True)


class ComidaOrcamento(models.Model):
    comida = models.ForeignKey(Comida, on_delete=models.DO_NOTHING, )
    orcamento = models.ForeignKey(Orcamento, on_delete=models.CASCADE, )
    valor = models.DecimalField(decimal_places=2, max_digits=8)
    quantidade = models.IntegerField()

    def __str__(self):
        return self.comida.nome


class LogisticaOrcamento(models.Model):
    id_logistica_orcamento = models.AutoField(primary_key=True)
    logistica = models.ForeignKey(Logistica, on_delete=models.DO_NOTHING, )
    orcamento = models.ForeignKey(Orcamento, on_delete=models.DO_NOTHING, )
    valor = models.DecimalField(decimal_places=2, max_digits=8)
    quantidade = models.IntegerField(default=1)
