# Generated by Django 4.2.13 on 2024-08-14 20:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_cliente_email_cliente_observacao_evento_tipo'),
    ]

    operations = [
        migrations.AddField(
            model_name='orcamento',
            name='data_alteracao',
            field=models.DateField(auto_now=True, null=True),
        ),
        migrations.AddField(
            model_name='orcamento',
            name='status',
            field=models.CharField(default='Aprovado', max_length=200),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='orcamento',
            name='cliente',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cliente', to='main.cliente'),
        ),
        migrations.AlterField(
            model_name='orcamento',
            name='evento',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evento', to='main.evento'),
        ),
    ]
