import {useState} from 'react';
import {Fragment} from 'react';
import {Row, Col, Form, Badge, Modal, Button} from 'react-bootstrap';
import {NumericFormat} from 'react-number-format';

interface LogisticaCidade {
    cidade: number,
    hospedagem: number,
    passagem: number,
    alimentacao: number,
    frete_terceiros: number,
    frete_proprio: number,
    frete_proprio_intervalo: number,
    frete_proprio_completo: number,
    diaria_completo: number,
    diaria_simples: number,
    logistica_lanches: number,
    logistica_lanches_grande: number,
}

const LogisticaOrcamentoComp = ({
                                    filterLogistica,
                                    setFilterLogistica,
                                    filteredLogisticas,
                                    logisticasSelecionadas,
                                    setLogisticas,
                                    setLogisticasSelecionadas,
                                    orcamento,
                                    logisticas,
                                    setOrcamento,
                                    valorLogisticaTotal,
                                    logisticaCidade,
                                    evento,
                                    handleChange
                                }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedLogistica, setSelectedLogistica] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({
        frete: '',
        diaria: '',
        lanches: ''
    });

    const handleLogisticaChange = (logistica) => {
        if (logistica.tipo === 'Material') {
            setSelectedLogistica(logistica);
            setShowModal(true);
        } else {
            handleToggleLogistica(logistica);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedOptions({
            frete: '',
            diaria: '',
            lanches: ''
        });
    };

    const handleQuantityLogisticaChange = (logistica_id: number, quantidade: number) => {
        setOrcamento(prevOrcamento => {
            if (!prevOrcamento) return prevOrcamento;
            const updatedLogistica = prevOrcamento.logisticas.map(logistica =>
                logistica.id === logistica_id ? {...logistica, quantidade} : logistica
            );
            return {...prevOrcamento, logisticas: updatedLogistica};
        });
    }


    const handleToggleLogistica = (logistica) => {
        if (logisticasSelecionadas.includes(logistica)) {
            // Remover da lista de selecionados e adicionar de volta à lista de disponíveis
            setLogisticasSelecionadas(logisticasSelecionadas.filter(l => l !== logistica));
            setLogisticas([...logisticas, logistica]);

            if (orcamento) {
                const updatedLogisticas = orcamento.logisticas.filter(log => log.id !== logistica.id_logistica);
                setOrcamento({...orcamento, logisticas: updatedLogisticas});
            }
        } else {
            // Adicionar à lista de selecionados e remover da lista de disponíveis
            setLogisticasSelecionadas([...logisticasSelecionadas, logistica]);
            setLogisticas(logisticas.filter(l => l !== logistica));

            if (orcamento) {
                setOrcamento({
                    ...orcamento,
                    logisticas: [...orcamento.logisticas, {id: logistica.id_logistica, quantidade: 1}]
                });
            }
        }
    };

    const handleModalSave = () => {
        if (selectedLogistica) {
            // Passa as opções selecionadas para o componente pai (Orcamento)
            handleToggleLogistica({...selectedLogistica, selectedOptions});
        }
        setShowModal(false);
    };

    const handleOptionChange = (group, value) => {
        setSelectedOptions((prev) => ({...prev, [group]: value}));
    };

    return (
        <>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="formGridLogisticas">
                    <Form.Label>Logisticas do Orçamento</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar Logistica..."
                        value={filterLogistica}
                        onChange={(e) => setFilterLogistica(e.target.value)}
                        style={{marginBottom: '10px'}}
                    />
                    <div
                        style={{maxHeight: '150px', overflowY: 'scroll', border: '1px solid #ced4da', padding: '10px'}}>
                        {filteredLogisticas.map((logistica) => (
                            <Form.Check
                                key={logistica.id_logistica}
                                type="checkbox"
                                label={logistica.nome}
                                value={logistica.id_logistica}
                                checked={logisticasSelecionadas.some(l => l.id_logistica === logistica.id_logistica)}
                                onChange={() => handleLogisticaChange(logistica)}
                            />
                        ))}
                    </div>
                </Form.Group>
                <Form.Group className="mb-3" as={Col} controlId="formGridLogisticasSelecionadas">
                    <Form.Label>Logisticas Selecionadas</Form.Label>
                    <div
                        style={{maxHeight: '150px', overflowY: 'scroll', border: '1px solid #ced4da', padding: '10px'}}>
                        {logisticasSelecionadas.map((logistica) => (
                            <div key={logistica.id_logistica}
                                 style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                <Form.Check
                                    key={logistica.id_logistica}
                                    type="checkbox"
                                    label={`${logistica.nome}-R$${logistica.valor}`}
                                    value={logistica.id_logistica}
                                    checked={true}
                                    onChange={() => handleToggleLogistica(logistica)}
                                />
                                <Form.Control
                                    type="number"
                                    value={orcamento?.logisticas.find(l => l.id === logistica.id_logistica)?.quantidade || 1}
                                    onChange={(e) => handleQuantityLogisticaChange(logistica.id_logistica, parseInt(e.target.value))}
                                    style={{width: '75px', marginLeft: '5px'}}
                                />
                            </div>
                        ))}
                    </div>
                </Form.Group>
            </Row>

            <Row>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Total R$ Logistica</Form.Label>
                    <Form.Control
                        type="text"
                        value={`R$${valorLogisticaTotal.toFixed(2)} | valor * alimentação(${logisticaCidade?.alimentacao}) * dias(${evento?.qtd_dias_evento})`}
                        disabled={true}
                    />
                    {logisticasSelecionadas.map((logistica) => (
                        <Fragment key={logistica.id_logistica}>
                            {(!logistica.in_sp && logistica.tipo === 'Pessoa') && (
                                <Badge bg="secondary">
                                    {logistica.nome}(Hospedagem:R${logisticaCidade?.hospedagem}, passagem:
                                    R${logisticaCidade?.passagem})
                                </Badge>
                            )}
                        </Fragment>
                    ))}
                </Form.Group>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Desconto para Logistica</Form.Label>
                    <NumericFormat
                        name="desconto_total_logisticas"
                        value={orcamento.desconto_total_logisticas}
                        onValueChange={(values) => {
                            const {floatValue} = values;
                            handleChange({target: {name: 'desconto_total_logisticas', value: floatValue || 0}});
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale={true}
                        allowNegative={false}
                        placeholder="Desconto Logistica"
                        customInput={Form.Control}
                    />
                </Form.Group>
            </Row>

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Escolha Opções para {selectedLogistica?.nome}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Frete</h5>
                    <Form.Check
                        type="radio"
                        label={'Frete Próprio Basico.  R$' + logisticaCidade?.frete_proprio}
                        name="frete"
                        value="frete_proprio"
                        checked={selectedOptions.frete === 'frete_proprio'}
                        onChange={(e) => handleOptionChange('frete', e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        label={'Frete Próprio + Int.  R$' + logisticaCidade?.frete_proprio_intervalo}
                        name="frete"
                        value="frete_proprio_intervalo"
                        checked={selectedOptions.frete === 'frete_proprio_intervalo'}
                        onChange={(e) => handleOptionChange('frete', e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        label={'Frete Próprio Completo  R$' + logisticaCidade?.frete_proprio_completo}
                        name="frete"
                        value="frete_proprio_completo"
                        checked={selectedOptions.frete === 'frete_proprio_completo'}
                        onChange={(e) => handleOptionChange('frete', e.target.value)}
                    />

                    <h5>Diária</h5>
                    <Form.Check
                        type="radio"
                        label={'Diária Completo  R$' + logisticaCidade?.diaria_completo}
                        name="diaria"
                        value="diaria_completo"
                        checked={selectedOptions.diaria === 'diaria_completo'}
                        onChange={(e) => handleOptionChange('diaria', e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        label={'Diária Simples  R$' + logisticaCidade?.diaria_simples}
                        name="diaria"
                        value="diaria_simples"
                        checked={selectedOptions.diaria === 'diaria_simples'}
                        onChange={(e) => handleOptionChange('diaria', e.target.value)}
                    />

                    <h5>Lanches</h5>
                    <Form.Check
                        type="radio"
                        label={'Logística Lanches < 800  R$' + logisticaCidade?.logistica_lanches}
                        name="lanches"
                        value="logistica_lanches"
                        checked={selectedOptions.lanches === 'logistica_lanches'}
                        onChange={(e) => handleOptionChange('lanches', e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        label={'Logística Lanches > 800  R$' + logisticaCidade?.logistica_lanches_grande} name="lanches"
                        value="logistica_lanches_grande"
                        checked={selectedOptions.lanches === 'logistica_lanches_grande'}
                        onChange={(e) => handleOptionChange('lanches', e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleModalSave}>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default LogisticaOrcamentoComp;
