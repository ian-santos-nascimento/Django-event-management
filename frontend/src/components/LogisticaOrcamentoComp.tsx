import {Fragment, useEffect, useState} from 'react';
import {Badge, Button, Col, Form, Modal, Row} from 'react-bootstrap';
import {NumericFormat} from 'react-number-format';
import {EventoType, LogisticaCidadeType, LogisticaType, OrcamentoType} from "../types";
import {parse} from "@fortawesome/fontawesome-svg-core";

interface Props {
    filterLogisticaState: string;
    logisticasMateriaisSelecionadas: LogisticaType[];
    logisticasPessoasSelecionadas: LogisticaType[];
    logisticasSelecionadas: LogisticaType[];
    setLogisticas: React.Dispatch<React.SetStateAction<LogisticaType[]>>;
    setLogisticasMateriaisSelecionadas: React.Dispatch<React.SetStateAction<LogisticaType[]>>;
    setLogisticasPessoasSelecionadas: React.Dispatch<React.SetStateAction<LogisticaType[]>>;
    orcamento: OrcamentoType;
    logisticas: LogisticaType[];
    setOrcamento: React.Dispatch<React.SetStateAction<OrcamentoType>>;
    logisticaCidade: LogisticaCidadeType;
    evento: EventoType;
}


const LogisticaOrcamentoComp: React.FC<Props> = ({
                                                     filterLogisticaState,
                                                     logisticasMateriaisSelecionadas,
                                                     logisticasPessoasSelecionadas,
                                                     setLogisticas,
                                                     setLogisticasMateriaisSelecionadas,
                                                     setLogisticasPessoasSelecionadas,
                                                     orcamento,
                                                     logisticas,
                                                     setOrcamento,
                                                     logisticaCidade,
                                                     evento
                                                 }) => {
    const [showModal, setShowModal] = useState(false);
    const logisticasPessoas = logisticas.filter(logistica => logistica.tipo === 'Pessoa');
    const logisticasMateriais = logisticas.filter(logistica => logistica.tipo === 'Material');
    const [selectedLogistica, setSelectedLogistica] = useState(null);
    const [filterLogistica, setFilterLogistica] = useState(filterLogisticaState || '');
    const [selectedOptions, setSelectedOptions] = useState({
        frete: '',
        diaria: '',
        lanches: ''
    });
    const [valorLogisticaTotal, setValorLogisticaTotal] = useState(orcamento?.valor_total_logisticas || 0)

    const filteredLogisticasMateriais = logisticasMateriais.filter(logistica =>
        logistica.nome.toLowerCase().includes(filterLogistica.toLowerCase())
    );

     const filteredLogisticasPessoas = logisticasPessoas.filter(logistica =>
        logistica.nome.toLowerCase().includes(filterLogistica.toLowerCase())
    );

    const handleChange = (e: { target: { name: string; value: any } }) => {
        const {name, value} = e.target;

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            [name]: value
        }));
    };


    const handleLogisticaChange = (logistica) => {
        if (logistica.tipo === 'Material') {
            setSelectedLogistica(logistica);
            setShowModal(true);
        } else {
            handleToggleLogisticaPessoa(logistica);
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

    //Calculo Logistica
    useEffect(() => {
        if (!orcamento || !evento || !logisticaCidade) {
            return;
        }
        const total = orcamento.logisticas.reduce((acc, logistica) => {
            const valorLogistica = parseFloat(logistica.valor);
            if (isNaN(valorLogistica)) {
                console.error(`Logistica valor is NaN for logistica id ${logistica.id}`);
                return acc;
            }
            const alimentacao = !isNaN(logisticaCidade.alimentacao) ? parseFloat(logisticaCidade.alimentacao) : 70;
            const dias_evento = evento.qtd_dias_evento || 1;
            const quantidade = logistica.quantidade || 1;
            const total_basico = (valorLogistica + alimentacao) * dias_evento * quantidade;
            const logisticaFilter = logisticas.find(logisticaList => logisticaList.id_logistica === logistica.id)
            const total_logistica_fora_sp = !logisticaFilter.in_sp ? parseFloat(logisticaCidade.passagem || 0) + (parseFloat(logisticaCidade.hospedagem || 0) * (dias_evento + 1)) : 0;
            return acc + total_basico + total_logistica_fora_sp;
        }, 0);
        setValorLogisticaTotal(total - orcamento.valor_desconto_logisticas);
        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            valor_total_logisticas: total - prevOrcamento.valor_desconto_logisticas
        }));
    }, [logisticasMateriaisSelecionadas, logisticasPessoasSelecionadas, orcamento.valor_desconto_logisticas, evento, orcamento.logisticas]);


    const handleQuantityLogisticaChange = (logistica_id: number, quantidade: number) => {
        setOrcamento((prevOrcamento: OrcamentoType) => {
            if (!prevOrcamento || !prevOrcamento.logisticas) return prevOrcamento;

            const updatedLogisticas = prevOrcamento.logisticas.map(log =>
                log.id === logistica_id ? {...log, quantidade} : log
            );

            return {...prevOrcamento, logisticas: updatedLogisticas} as OrcamentoType;
        });
    };

    const handleToggleLogisticaMaterial = (logistica) => {
        const isSelected = logisticasMateriaisSelecionadas.some(l => l.id_logistica === logistica.id_logistica);

        if (isSelected) { //remove a logistica da lista de selecionada
            const updateLogisticaSelecionada = logisticasMateriaisSelecionadas.filter(l => l.id_logistica !== logistica.id_logistica);
            setLogisticasMateriaisSelecionadas(updateLogisticaSelecionada);
            if (orcamento) {
                const updatedLogisticas = orcamento.logisticas.filter(log => log.id !== logistica.id_logistica);
                setOrcamento({...orcamento, logisticas: updatedLogisticas});
            }
        } else {
            setLogisticasMateriaisSelecionadas([...logisticasMateriaisSelecionadas, logistica]);

            if (orcamento) {
                setOrcamento({
                    ...orcamento,
                    logisticas: [...orcamento.logisticas, {
                        id: logistica.id_logistica,
                        quantidade: 1,
                        valor: logistica.valor,
                        logistica: logistica.nome
                    }]
                });
            }

        }
    };
    const handleToggleLogisticaPessoa = (logistica) => {
        const isSelected = logisticasPessoasSelecionadas.some(l => l.id_logistica === logistica.id_logistica);

        if (isSelected) { //remove a logistica da lista de selecionada
            const updateLogisticaSelecionada = logisticasPessoasSelecionadas.filter(l => l.id_logistica !== logistica.id_logistica);
            setLogisticasPessoasSelecionadas(updateLogisticaSelecionada);
            if (orcamento) {
                const updatedLogisticas = orcamento.logisticas.filter(log => log.id !== logistica.id_logistica);
                setOrcamento({...orcamento, logisticas: updatedLogisticas});
            }
        } else {
            setLogisticasPessoasSelecionadas([...logisticasPessoasSelecionadas, logistica]);

            if (orcamento) {
                setOrcamento({
                    ...orcamento,
                    logisticas: [...orcamento.logisticas, {
                        id: logistica.id_logistica,
                        quantidade: 1,
                        valor: logistica.valor,
                        logistica: logistica.nome
                    }]
                });
            }

        }
    };

    const handleModalSave = () => {
        if (selectedLogistica) {
            handleToggleLogisticaMaterial({...selectedLogistica, selectedOptions});
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
                    <Form.Label>Logisticas Pessoas</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar Logistica..."
                        value={filterLogistica}
                        onChange={(e) => setFilterLogistica(e.target.value)}
                        style={{marginBottom: '10px'}}
                    />
                    <div
                        style={{maxHeight: '150px', overflowY: 'scroll', border: '1px solid #ced4da', padding: '10px'}}>
                        {filteredLogisticasPessoas.map((logistica) => (
                            <Form.Check
                                key={logistica.id_logistica}
                                type="checkbox"
                                label={logistica.nome}
                                value={logistica.id_logistica}
                                checked={logisticasPessoasSelecionadas.some(l => l.id_logistica === logistica.id_logistica)}
                                onChange={() => handleLogisticaChange(logistica)}
                            />
                        ))}
                    </div>
                </Form.Group>
                <Form.Group className="mb-3" as={Col} controlId="formGridLogisticasSelecionadas">
                    <Form.Label>Logisticas Selecionadas de Pessoas</Form.Label>
                    <div
                        style={{maxHeight: '150px', overflowY: 'scroll', border: '1px solid #ced4da', padding: '10px'}}>
                        {logisticasPessoasSelecionadas.map((logistica) => (
                            <div key={logistica.id_logistica}
                                 style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                <Form.Check
                                    key={logistica.id_logistica}
                                    type="checkbox"
                                    label={`${logistica.nome}-R$${logistica.valor}`}
                                    value={logistica.id_logistica}
                                    checked={true}
                                    onChange={() => handleToggleLogisticaPessoa(logistica)}
                                />
                                <Form.Control
                                    type="number"
                                    value={orcamento?.logisticas?.find(l => l.id === logistica.id_logistica)?.quantidade || 1}
                                    onChange={(e) => handleQuantityLogisticaChange(logistica.id_logistica, parseInt(e.target.value))}
                                    style={{width: '75px', marginLeft: '5px'}}
                                />
                            </div>
                        ))}
                    </div>
                </Form.Group>
            </Row>
             <Row>
                <Form.Group as={Col} className="mb-3" controlId="formGridLogisticas">
                    <Form.Label>Logisticas de Material</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Buscar Logistica..."
                        value={filterLogistica}
                        onChange={(e) => setFilterLogistica(e.target.value)}
                        style={{marginBottom: '10px'}}
                    />
                    <div
                        style={{maxHeight: '150px', overflowY: 'scroll', border: '1px solid #ced4da', padding: '10px'}}>
                        {filteredLogisticasMateriais.map((logistica) => (
                            <Form.Check
                                key={logistica.id_logistica}
                                type="checkbox"
                                label={logistica.nome}
                                value={logistica.id_logistica}
                                checked={logisticasMateriaisSelecionadas.some(l => l.id_logistica === logistica.id_logistica)}
                                onChange={() => handleLogisticaChange(logistica)}
                            />
                        ))}
                    </div>
                </Form.Group>
                <Form.Group className="mb-3" as={Col} controlId="formGridLogisticasSelecionadas">
                    <Form.Label>Logisticas Selecionadas de Material</Form.Label>
                    <div
                        style={{maxHeight: '150px', overflowY: 'scroll', border: '1px solid #ced4da', padding: '10px'}}>
                        {logisticasMateriaisSelecionadas.map((logistica) => (
                            <div key={logistica.id_logistica}
                                 style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                                <Form.Check
                                    key={logistica.id_logistica}
                                    type="checkbox"
                                    label={`${logistica.nome}-R$${logistica.valor}`}
                                    value={logistica.id_logistica}
                                    checked={true}
                                    onChange={() => handleLogisticaChange(logistica)}
                                />
                                <Form.Control
                                    type="number"
                                    value={orcamento?.logisticas?.find(l => l.id === logistica.id_logistica)?.quantidade || 1}
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
                        value={`R$${valorLogisticaTotal ? valorLogisticaTotal : 0} | valor * alimentação(${logisticaCidade?.alimentacao}) * dias(${evento?.qtd_dias_evento})`}
                        disabled={true}
                    />
                    {logisticasPessoasSelecionadas.map((logistica) => (
                        <Fragment key={logistica.id_logistica}>
                            {(!logistica.in_sp && logistica.tipo === 'Pessoa') && (
                                <Badge bg="secondary">
                                    {logistica.nome}(Hospedagem:R${logisticaCidade?.hospedagem}, passagem:
                                    R${logisticaCidade?.passagem})
                                </Badge>
                            )}
                        </Fragment>
                    ))}
                    {logisticasPessoasSelecionadas.map((logistica) => (
                        <Fragment key={logistica.id_logistica}>
                            {(!logistica.in_sp && logistica.tipo === 'Material') && (
                                <Badge bg="secondary">
                                    {logistica.nome}(Frete:R${logisticaCidade?.fre}, passagem:
                                    R${logisticaCidade?.passagem})
                                </Badge>
                            )}
                        </Fragment>
                    ))}
                </Form.Group>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Desconto para Logistica</Form.Label>
                    <NumericFormat
                        name="valor_desconto_logisticas"
                        value={orcamento?.valor_desconto_logisticas || 0}
                        onValueChange={(values) => {
                            const {floatValue} = values;
                            handleChange({target: {name: 'valor_desconto_logisticas', value: floatValue || 0}});
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
