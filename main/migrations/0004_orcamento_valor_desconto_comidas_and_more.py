# Generated by Django 4.2.13 on 2024-07-21 13:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_alter_comida_valor'),
    ]

    operations = [
        migrations.AddField(
            model_name='orcamento',
            name='valor_desconto_comidas',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='orcamento',
            name='valor_desconto_logisticas',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='orcamento',
            name='valor_total_comidas',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='orcamento',
            name='valor_total_logisticas',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
    ]
