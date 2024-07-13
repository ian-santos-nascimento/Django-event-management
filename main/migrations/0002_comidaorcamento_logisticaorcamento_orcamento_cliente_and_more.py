# Generated by Django 4.2.13 on 2024-07-12 13:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ComidaOrcamento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('valor', models.DecimalField(decimal_places=2, max_digits=8)),
                ('quantidade', models.IntegerField()),
                ('comida', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='main.comida')),
            ],
        ),
        migrations.CreateModel(
            name='LogisticaOrcamento',
            fields=[
                ('id_logistica_orcamento', models.AutoField(primary_key=True, serialize=False)),
                ('valor', models.DecimalField(decimal_places=2, max_digits=8)),
                ('logistica', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='main.logistica')),
            ],
        ),
        migrations.AddField(
            model_name='orcamento',
            name='cliente',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='orcamentos', to='main.cliente'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='orcamento',
            name='nome',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='cliente',
            name='endereco',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='main.endereco'),
        ),
        migrations.AlterField(
            model_name='localevento',
            name='cidade',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='main.cidade'),
        ),
        migrations.AlterField(
            model_name='logisticacidade',
            name='cidade',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='main.cidade'),
        ),
        migrations.DeleteModel(
            name='ComidaEvento',
        ),
        migrations.AddField(
            model_name='logisticaorcamento',
            name='orcamento',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='main.orcamento'),
        ),
        migrations.AddField(
            model_name='comidaorcamento',
            name='orcamento',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='main.orcamento'),
        ),
        migrations.AddField(
            model_name='orcamento',
            name='comidas',
            field=models.ManyToManyField(through='main.ComidaOrcamento', to='main.comida'),
        ),
        migrations.AddField(
            model_name='orcamento',
            name='logisticas',
            field=models.ManyToManyField(through='main.LogisticaOrcamento', to='main.logistica'),
        ),
    ]
