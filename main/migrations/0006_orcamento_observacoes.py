# Generated by Django 4.2.13 on 2024-07-21 13:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_logisticaorcamento_quantidade'),
    ]

    operations = [
        migrations.AddField(
            model_name='orcamento',
            name='observacoes',
            field=models.TextField(default='', max_length=2000),
            preserve_default=False,
        ),
    ]
