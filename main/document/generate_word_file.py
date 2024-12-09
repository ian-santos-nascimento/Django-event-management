from datetime import datetime

from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import RGBColor


def generate_orcamento_doc(orcamento_id, data) -> Document:
    orcamento = data['orcamento']
    document = Document()

    heading = document.add_heading(
        f"{orcamento['evento']['nome']} - {formatar_data(orcamento['evento']['data_inicio'])}",
        level=1)
    heading.runs[0].bold = True
    heading.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER

    document.add_paragraph(
        f"Data: {formatar_data(orcamento['evento']['data_inicio'])} a {formatar_data(orcamento['evento']['data_fim'])}")
    document.add_paragraph(f"Horário: 08:00 às 18:00")
    document.add_paragraph(f"Local: {orcamento['evento']['local']} - {orcamento['evento'].get('descricao', '')}")

    for data_evento, intervalos in data['data'].items():
        data_formatada = formatar_data(data_evento)
        document.add_heading(f"Cardápio - {data_formatada}", level=2)

        for nome_intervalo, intervalo in intervalos.items():
            nome_intervalo_formatado = (
                "Intervalo Manhã" if nome_intervalo == "Intervalo_manha" else
                "Intervalo Almoço" if nome_intervalo == "Intervalo_almoco" else
                "Intervalo Tarde"
            )

            document.add_heading(nome_intervalo_formatado, level=3)

            if not intervalo['comidas']:
                format_line_red(document, "Sem itens definidos para este intervalo.")
            else:
                for comida in intervalo['comidas']:
                    quantidade = next(
                        (item['quantidade'] for item in orcamento['comidas']
                         if item['comida_id'] == comida['comida_id']),
                        0
                    )
                    document.add_paragraph(
                        f"- {comida['nome']}: R${comida['valor']} para {quantidade} unidades"
                    )

    if orcamento.get('observacoes'):
        document.add_heading("Observações", level=2)
        document.add_paragraph(orcamento['observacoes'])

    return document


def format_line_red(document: Document, text: str) -> None:
    run = document.add_paragraph().add_run(text)
    font = run.font
    font.color.rgb = RGBColor(255, 0, 0)


def formatar_data(data_str):
    try:
        return datetime.strptime(data_str, '%d-%m-%Y').strftime('%d/%m/%Y')
    except ValueError:
        try:
            return datetime.strptime(data_str, '%Y-%m-%d').strftime('%d/%m/%Y')
        except ValueError:
            return data_str
