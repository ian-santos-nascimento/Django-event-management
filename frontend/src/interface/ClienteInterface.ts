export interface ClienteInterface{
    id_cliente: string,
    razao_social: string,
    cnpj: string,
    inscricao_estadual: string,
    nome: string,
    telefone: string,
    endereco: {
        "id_endereco": number,
        "cep": string,
        "endereco": string,
        "bairro": string,
        "cidade": string,
        "estado": string,
        "numero": string,
        "complemento": string
    },
    prazo_pagamento: string,
    taxa_financeira: number,
    inicio_contrato: string,
    fim_contrato: string,
}
