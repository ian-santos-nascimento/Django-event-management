# Generated by Django 4.2.13 on 2024-07-09 14:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_remove_logistica_dias_alter_logistica_tipo'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='logistica',
            name='evento',
        ),
    ]
