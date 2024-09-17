// @ts-ignore
import {ComidaType, LogisticaCidadeType} from "../types.tsx"

export default function verificarFrete(cardapioSelecionado: ComidaType[], logisticaCidade: LogisticaCidadeType) {
    const temIntervaloDoce = cardapioSelecionado.some(item => item.tipo === "Intervalo_Doce");
    const temIntervaloSalgado = cardapioSelecionado.some(item => item.tipo === "Intervalo_Salgado");
    const temAlmoco = cardapioSelecionado.some(item => item.tipo === "Almoço");
    if (!temIntervaloDoce && !temIntervaloSalgado && !temAlmoco) {
        return logisticaCidade.frete_proprio;
    } else if (temIntervaloDoce || temIntervaloSalgado && !temAlmoco) {
        return logisticaCidade.frete_proprio_intervalo;
    } else if (temAlmoco) {
        return logisticaCidade.frete_proprio_completo;
    }

}