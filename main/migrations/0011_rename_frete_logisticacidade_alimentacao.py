# Generated by Django 4.2.13 on 2024-07-09 20:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0010_logistica_excluida'),
    ]

    operations = [
        migrations.RenameField(
            model_name='logisticacidade',
            old_name='frete',
            new_name='alimentacao',
        ),
    ]
