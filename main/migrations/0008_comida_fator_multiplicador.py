# Generated by Django 4.2.13 on 2024-11-25 22:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_remove_orcamento_data_alteracao_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='comida',
            name='fator_multiplicador',
            field=models.DecimalField(decimal_places=3, default=1.0, max_digits=6),
        ),
    ]
