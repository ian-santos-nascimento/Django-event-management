# Generated by Django 4.2.13 on 2024-07-04 19:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_remove_localevento_agravo_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cidade',
            name='id_cidade',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
