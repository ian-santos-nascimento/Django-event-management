# Generated by Django 4.2.13 on 2024-11-15 21:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_desconto_orcamento_descontos'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cliente',
            name='taxa_financeira',
            field=models.DecimalField(blank=True, decimal_places=4, max_digits=8, null=True),
        ),
    ]
