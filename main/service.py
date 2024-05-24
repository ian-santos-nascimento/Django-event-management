
SUL_SUDESTE = ['PR', 'SC', 'RS', 'SP', 'MG', 'RJ', 'ES']
NORTE_NORDESTE = ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA', 'TO', 'PA', 'AP', 'RO', 'AM', 'AC', 'RR']
CENTRO_OESTE = ['MT', 'GO', 'MS']


def incluiAgravoRegiao(localEvento):
    if localEvento.endereco.estado == 'SP' and localEvento.endereco.cidade == 'São Paulo':
        localEvento.agravo = 0.0
    elif localEvento.endereco.estado in SUL_SUDESTE:
        localEvento.agravo = 0.1
    elif localEvento.endereco.estado in CENTRO_OESTE:
        localEvento.agravo = 0.15
    elif localEvento.endereco.estado in NORTE_NORDESTE:
        localEvento.agravo = 0.2
    return localEvento