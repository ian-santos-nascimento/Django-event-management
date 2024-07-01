import pandas as pd

from main.models import Comida


def createComidaFromCsv(file):
    print(file)
    if file: ##TODO verificar o tipo da comida pra agrupar
        df = pd.read_excel(file)
        df.fillna('', inplace=True)
        linhas = df.values.tolist()
        i = 1
        for linha in linhas:
            nova_comida = Comida(nome=linha[0], valor=linha[1], quantidade_minima=linha[2], descricao=linha[3], )
            i += 1
            nova_comida.save()
    else:
        print('Empty')
