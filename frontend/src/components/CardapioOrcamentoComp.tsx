import {useEffect, useState} from "react";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import {NumericFormat} from "react-number-format";
import type {ComidaType} from "../types";

const CardapioOrcamentoComp = ({
                                   cardapio, setCardapio, selectedCardapio, setSelectedCardapio, orcamento,
                                   setOrcamento, evento, filter
                               }) => {

    const [filterCardapio, setFilterCardapio] = useState(filter)
    const [valorComidaTotal, setValorComidaTotal] = useState(orcamento.valor_total_comidas | 0.0)

    useEffect(() => {
        const cliente = evento.clientes.find(cliente => cliente.id_cliente === orcamento?.cliente?.id_cliente)
        if (orcamento && orcamento.comidas) {
            const total = selectedCardapio.reduce((acc, comida) => {
                const quantidade = orcamento?.comidas.find(c => c.comida_id === comida.comida_id)?.quantidade || comida.quantidade_minima;
                const total_comida_evento = (acc + comida.valor * quantidade);
                return total_comida_evento + (total_comida_evento * parseFloat(cliente?.taxa_financeira || evento.clientes[0].taxa_financeira));
            }, 0);
            setValorComidaTotal(total - orcamento.valor_desconto_comidas);
            setOrcamento({...orcamento, valor_total_comidas: valorComidaTotal})
        }
    }, [orcamento.comidas, orcamento.valor_desconto_comidas, selectedCardapio, evento]);

    const handleQuantityChange = (comida_id: number, quantidade: number) => {
        if (!orcamento || !orcamento.comidas) {
            return orcamento;
        }
        setOrcamento(prevOrcamento => {
            const updatedComidas = prevOrcamento.comidas.map(comida =>
                comida.comida_id === comida_id ? {...comida, id: comida_id, quantidade: quantidade} : comida
            );
            return {...prevOrcamento, comidas: updatedComidas};
        });

    };


    const handleToggleComida = (comida: ComidaType) => {
        if (selectedCardapio.some(c => c.comida_id === comida.comida_id)) {
            const updatedComidasSelecionadas = selectedCardapio.filter(c => c.comida_id !== comida.comida_id);
            setSelectedCardapio(updatedComidasSelecionadas);
            if (orcamento) {
                const updatedComidas = orcamento.comidas.filter(c => c.comida_id !== comida.comida_id);
                setOrcamento({...orcamento, comidas: updatedComidas});
            }
        } else {
            const updatedComida = {...comida, quantidade: comida.quantidade_minima};
            setSelectedCardapio([...selectedCardapio, updatedComida]);
            if (orcamento) {
                setOrcamento({
                    ...orcamento,
                    comidas: [...orcamento.comidas, {comida_id: comida.comida_id, quantidade: comida.quantidade_minima}]
                });
            }
        }
    };
    const filteredComidas = cardapio?.filter(comida =>
        comida.nome.toLowerCase().includes(filterCardapio.toLowerCase())
    );

    const handleChange = (e: { target: { name: string; value: any } }) => {
        const {name, value} = e.target;

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            [name]: value
        }));
    };


    return (
        <div>
            <Row className='mb-3'>
                <Form.Group as={Col} controlId="formGridComidas">
                    <Form.Label>Comidas do Orçamento</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar comida..."
                        value={filterCardapio}
                        onChange={(e) => setFilterCardapio(e.target.value)}
                        style={{marginBottom: '10px'}}
                    />
                    <div style={{
                        maxHeight: '150px',
                        overflowY: 'scroll',
                        border: '1px solid #ced4da',
                        padding: '10px'
                    }}>
                        {filteredComidas.map((comida) => (
                            <Form.Check
                                key={comida.comida_id}
                                type="checkbox"
                                label={comida.nome}
                                value={comida.comida_id}
                                checked={selectedCardapio.some(c => c.comida_id === comida.comida_id)}
                                onChange={() => handleToggleComida(comida)}
                            />
                        ))}
                    </div>
                </Form.Group>
                <Form.Group as={Col} controlId="formGridComidasSelecionadas">
                    <Form.Label>Comidas Selecionadas</Form.Label>
                    <div style={{
                        maxHeight: '150px',
                        overflowY: 'scroll',
                        border: '1px solid #ced4da',
                        padding: '10px'
                    }}>
                        {selectedCardapio.map((comida) => (
                            <div key={comida.comida_id}
                                 style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                <Form.Check
                                    type="checkbox"
                                    label={`${comida.nome}-R$${comida.valor}`}
                                    value={comida.comida_id}
                                    checked={true}
                                    onChange={() => handleToggleComida(comida)}
                                />
                                <Form.Control
                                    type="number"
                                    min={comida.quantidade_minima}
                                    value={orcamento?.comidas?.find(c => c.comida_id === comida.comida_id)?.quantidade || comida.quantidade_minima}
                                    onChange={(e) => handleQuantityChange(comida.comida_id, parseInt(e.target.value))}
                                    style={{width: '75px', marginLeft: '5px'}}
                                />
                            </div>
                        ))}
                    </div>
                </Form.Group>

            </Row>
            <Row className='mb-3'>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Total R$ comidas</Form.Label>
                    <Form.Control
                        type="text"
                        value={`R$${valorComidaTotal.toFixed(2)}` || 0}
                        disabled={true}
                    />
                </Form.Group>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Desconto para Cardápio</Form.Label>
                    <NumericFormat
                        name="desconto_total_comidas"
                        value={orcamento.valor_desconto_comidas}
                        onValueChange={(values) => {
                            const {floatValue} = values;
                            handleChange({target: {name: 'valor_desconto_comidas', value: floatValue || 0}});
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale={true}
                        allowNegative={false}
                        placeholder="Desconto Comida"
                        customInput={Form.Control}
                    />
                </Form.Group>
            </Row>
        </div>
    )

}

export default CardapioOrcamentoComp;