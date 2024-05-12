# Generated by Django 5.0.4 on 2024-05-10 20:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='cliente',
            name='cidade',
            field=models.CharField(default='Nenhuma', max_length=200),
        ),
        migrations.AddField(
            model_name='cliente',
            name='evento_pk',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='main.evento'),
        ),
    ]
