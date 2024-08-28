import {useEffect, useState} from "react";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import {NumericFormat} from "react-number-format";
import {ComidaType, EventoType, LogisticaCidadeType, OrcamentoType} from "../types";
import {Badge} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import {SUBCATEGORIAS_COMIDA, TIPO_COMIDA} from "../util/OptionList"

interface Props {
    logisticaCidade: LogisticaCidadeType;
    cardapio: ComidaType[];
    selectedCardapio: ComidaType[];
    orcamento: OrcamentoType;
    setOrcamento: React.Dispatch<React.SetStateAction<OrcamentoType>>;
    setSelectedCardapio: React.Dispatch<React.SetStateAction<ComidaType[]>>;
    evento: EventoType;
}

const CardapioOrcamentoComp: React.FC<Props> = ({
                                                    cardapio,
                                                    logisticaCidade,
                                                    orcamento,
                                                    selectedCardapio,
                                                    setSelectedCardapio,
                                                    setOrcamento,
                                                    evento,
                                                }) => {

    const [valorComidaTotal, setValorComidaTotal] = useState(orcamento.valor_total_comidas | 0.0)
    const [selectCategoria, setSelectCategoria] = useState({tipo: '', subtipo: ''})
    const [showModal, setShowModal] = useState(false)
    const filteredSubcategories = SUBCATEGORIAS_COMIDA[selectCategoria.tipo] || [];
    const filteredComidas = cardapio.filter(comida => comida.subtipo === selectCategoria.subtipo)

    useEffect(() => {
        if (orcamento && orcamento.comidas) {
            var total = selectedCardapio.reduce((acc, comida) => {
                const quantidade = orcamento?.comidas.find(c => c.comida_id === comida.comida_id)?.quantidade || comida.quantidade_minima;
                return (acc + comida.valor * quantidade);
            }, 0) - orcamento.valor_desconto_comidas;
            total += total * parseFloat(logisticaCidade?.taxa_deslocamento)
            setValorComidaTotal(total);
            setOrcamento({...orcamento, valor_total_comidas: total})
        }
    }, [orcamento.comidas, orcamento.valor_desconto_comidas, selectedCardapio]);

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

    const handleCategoryChange = (e) => {
        const {value} = e.target;
        setSelectCategoria({tipo: value, subtipo: ''})

    }

    const handleChangeSubCategoria = (e) => {
        const {value} = e.target
        setSelectCategoria({...selectCategoria, subtipo: value})
        setShowModal(true)
    }


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
                    comidas: [...orcamento.comidas, {
                        comida_id: comida.comida_id,
                        quantidade: comida.quantidade_minima,
                        valor: comida.valor,
                        comida: comida.nome
                    }]
                });
            }
        }
    };

    const handleChange = (e: { target: { name: string; value: any } }) => {
        const {name, value} = e.target;

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            [name]: value
        }));
    };


    return (
        <div>
            <Row>
                <Form.Group as={Col} controlId="formGriCategoria">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select
                        required
                        name="tipo"
                        value={selectCategoria.tipo}
                        onChange={handleCategoryChange} // Atualiza a categoria e reseta a subcategoria
                    >
                        <option value={''}>Escolha uma categoria</option>
                        {TIPO_COMIDA.map((tipo, index) => (
                            <option value={tipo} key={index}>{tipo}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        Escolha o tipo da comida
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} controlId="formGriSubCategoria">
                    <Form.Label>Subcategoria</Form.Label>
                    <Form.Select
                        required
                        name="subtipo"
                        value={selectCategoria.subtipo}
                        onChange={handleChangeSubCategoria} // Atualiza a subcategoria
                    >
                        <option value={''}>Escolhe uma SubCategoria</option>
                        {filteredSubcategories.map((sub, index) => (
                            <option value={sub} key={index}>{sub}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        Escolha a subcategoria da comida
                    </Form.Control.Feedback>
                </Form.Group>

            </Row>
            <Row className='mb-3'>
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
                    <Badge bg="secondary">
                        Sem imposto:
                        R${(valorComidaTotal - (valorComidaTotal * logisticaCidade?.taxa_deslocamento)).toFixed(2)}
                    </Badge>
                </Form.Group>

            </Row>
            <Row className='mb-3'>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Total R$ comidas (Com {logisticaCidade?.taxa_deslocamento * 100}% incluso)</Form.Label>
                    <Form.Control
                        type="text"
                        value={`R$${valorComidaTotal.toFixed(2) || 0}`}
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
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Selecionar Comidas</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                </Modal.Body>
            </Modal>
        </div>
    )

}

export default CardapioOrcamentoComp;