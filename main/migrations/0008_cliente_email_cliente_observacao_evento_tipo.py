# Generated by Django 4.2.13 on 2024-08-08 22:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_logisticacidade_diaria_completo_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='cliente',
            name='email',
            field=models.EmailField(default='algumacoisa@gmail.com', max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='cliente',
            name='observacao',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='evento',
            name='tipo',
            field=models.CharField(default='Congressos', max_length=100),
            preserve_default=False,
        ),
    ]