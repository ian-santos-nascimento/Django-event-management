import pandas as pd
from main.models import Comida
import logging

logging.basicConfig(level=logging.INFO)


def createComidaFromCsv(file):
    print(file)
    if file:
        df = pd.read_excel(file)
        df.fillna('', inplace=True)
        linhas = df.values.tolist()
        i = 1
        for linha in linhas:
            if linha[1] == '':
                logging.info("Comida: %s,linha %d ", linha, i)
            nova_comida = Comida(nome=linha[0], valor=linha[1], quantidade_minima=linha[2], descricao=linha[3], )
            logging.info("Comida salva: %s,linha %d ", linha, i)
            i += 1
            nova_comida.save()
    else:
        print('Empty')
