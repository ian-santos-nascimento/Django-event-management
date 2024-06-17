from django.contrib import admin
from .models import *


# Register your models here.

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    pass


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    pass


@admin.register(Logistica)
class Logisticadmin(admin.ModelAdmin):
    pass




@admin.register(Orcamento)
class OrcamentoAdmin(admin.ModelAdmin):
    pass



@admin.register(LocalEvento)
class LocalEventoAdmin(admin.ModelAdmin):
    pass
