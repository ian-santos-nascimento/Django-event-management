import {useEffect, useState} from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {parse} from "@fortawesome/fontawesome-svg-core";

interface Orcamento {
    id_orcamento: number,
    nome: string,
    cliente: number,
    evento: number,
    logisticas: [{
        id: number,
        quantidade: number
    }],
    comidas: [{
        id: number,
        quantidade: number
    }],
    observacoes: string,
    valor_total_comidas: number,
    desconto_total_comidas: number,
    valor_total_logisticas: number,
    desconto_total_logisticas: number,

}

interface Evento {
    id_evento: number;
    codigo_evento: number;
    nome: string;
    descricao: string;
    observacao: string;
    qtd_dias_evento: number;
    qtd_pessoas: number;
    data_inicio: string;
    data_fim: string;
    local: Local;
    clientes: Cliente[];
}

interface Comida {
    comida_id: number,
    nome: string,
    descricao: string
    valor: number,
    quantidade_minima: number
    tipo: string
}

interface Cliente {
    id_cliente: number,
    cnpj: string,
    nome: string,
    taxa_financeira: string,
}

interface Local {
    "id_local": number,
    "nome": string,
    "endereco": string,
    "telefone": string,
    "email": string,
    "observacoes": string,
    "excluida": boolean,
    "cidade": number
}

interface LogisticaCidade {
    cidade: number,
    hospedagem: number,
    passagem: number,
    alimentacao: number,

}

interface Logistica {
    id_logistica: number,
    nome: string,
    descricao: string,
    valor: number,
    tipo: string,
    in_sp: boolean,
}

interface LogisticaCidade {
    id_logistica_cidade: number
    cidade: number
    hospedagem: number
    passagem: number
    alimentacao: number
}

const API_URL = process.env.REACT_APP_API_URL;

export default function Orcamento({orcamentoState, eventoState: eventoId}) {
    const [orcamento, setOrcamento] = useState<Orcamento>(orcamentoState)
    const [comidas, setComidas] = useState<Comida[]>([])
    const [comidasSelecionadas, setComidasSelecionadas] = useState<Comida[]>([]);
    const [logisticas, setLogisticas] = useState<Logistica[]>([])
    const [logisticaCidade, setLogisticaCidade] = useState<LogisticaCidade>()
    const [logisticasSelecionadas, setLogisticasSelecionadas] = useState<Logistica[]>([])
    const [clientesSelecionados, setClientesSelecionados] = useState<Cliente>()
    const [evento, setEvento] = useState<Evento>({
        id_evento: 0,
        codigo_evento: 0,
        nome: '',
        descricao: '',
        observacao: '',
        qtd_dias_evento: 0,
        qtd_pessoas: 0,
        data_inicio: '',
        data_fim: '',
        local: {
            id_local: 0,
            nome: "",
            endereco: "",
            telefone: "",
            email: "",
            observacoes: "",
            excluida: false,
            cidade: null
        },
        clientes: []
    })
    const [valorComidaTotal, setValorComidaTotal] = useState(0.0)
    const [valorLogisticaTotal, setValorLogisticaTotal] = useState(0)

    useEffect(() => {
        getModels();
    }, []);

    useEffect(() => {
        if (!evento.clientes || evento) {
            const eventoResponse = axios.get(`${API_URL}eventos/${eventoId}`).then(response => {
                setEvento(response.data as Evento)
                setOrcamento({...orcamento, evento: eventoId})
            });
        }
    }, []);

    useEffect(() => {
        if (evento && evento.local && evento.local.cidade) {
            console.log("Calling getLogisticaCidade with evento:", evento);
            getLogisticaCidade()
            setOrcamento({...orcamento, cliente: evento.clientes[0].id_cliente})
        } else {
            console.log("Evento not ready yet:", evento);
        }
    }, [evento]);

    //Calculo Comida
    useEffect(() => {
        const cliente = evento.clientes.find(cliente => cliente.id_cliente === orcamento.cliente)
        const total = comidasSelecionadas.reduce((acc, comida) => {
            const quantidade = orcamento?.comidas.find(c => c.id === comida.comida_id)?.quantidade || comida.quantidade_minima;
            const total_comida_evento = (acc + comida.valor * quantidade);
            return total_comida_evento + (total_comida_evento * parseFloat(cliente?.taxa_financeira || evento.clientes[0].taxa_financeira));
        }, 0);
        setValorComidaTotal(total);
    }, [orcamento, comidasSelecionadas, evento]);

    //Calculo Logistica
    useEffect(() => {
        if (!orcamento || !logisticasSelecionadas.length || !evento || !logisticaCidade) {
            return;
        }
        const total = logisticasSelecionadas.reduce((acc, logistica) => {
            const valorLogistica = parseFloat(logistica.valor);
            if (isNaN(valorLogistica)) {
                console.error(`Logistica valor is NaN for logistica id ${logistica.id_logistica}`);
                return acc;
            }
            const alimentacao = !isNaN(parseFloat(logisticaCidade.alimentacao)) ? parseFloat(logisticaCidade.alimentacao) : 70;
            const dias_evento = evento.qtd_dias_evento || 1;
            const quantidade = orcamento?.logisticas.find(l => l.id === logistica.id_logistica)?.quantidade || 1;
            const total_basico = (valorLogistica + alimentacao) * dias_evento * quantidade;
            const total_logistica_fora_sp = !logistica.in_sp ? (parseFloat(logisticaCidade.passagem) || 0) + ((parseFloat(logisticaCidade.hospedagem) || 0) * (dias_evento + 2)) : 0;
            return acc + total_basico + total_logistica_fora_sp;
        }, 0);

        if (isNaN(total)) {
            console.error('Total is NaN');
        } else {
            setValorLogisticaTotal(total);
        }
    }, [orcamento, logisticasSelecionadas, evento, logisticaCidade]);


    async function getLogisticaCidade() {
        if (evento && evento.local && evento.local.cidade !== null) {
            try {
                const response = await axios.get(`${API_URL}logistica-cidade/${evento.local.cidade}`);
                setLogisticaCidade(response.data as LogisticaCidade);
            } catch (e) {
                console.error('Error fetching LogisticaCidade:', e);
            }
        }
    }

    async function getModels() {
        try {
            const logisticasResponse = await axios.get(`${API_URL}logisticas/`);
            setLogisticas(logisticasResponse.data as Logistica[]);

            const comidasResponse = await axios.get(`${API_URL}comidas/`);
            setComidas(comidasResponse.data as Comida[]);

        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                window.location.href = '/login';
            } else {
                console.error('Error fetching data:', error);
            }
        }
    }

    const handleToggleComida = (comida: Comida) => {
        if (comidasSelecionadas.some(c => c.comida_id === comida.comida_id)) {
            // Remover da lista de selecionados
            const updatedComidasSelecionadas = comidasSelecionadas.filter(c => c.comida_id !== comida.comida_id);
            setComidasSelecionadas(updatedComidasSelecionadas);

            if (orcamento) {
                const updatedComidas = orcamento.comidas.filter(c => c.id !== comida.comida_id);
                setOrcamento({...orcamento, comidas: updatedComidas});
            }
        } else {
            // Adicionar à lista de selecionados com quantidade mínima inicial
            const updatedComida = {...comida, quantidade: comida.quantidade_minima};
            setComidasSelecionadas([...comidasSelecionadas, updatedComida]);

            if (orcamento) {
                setOrcamento({
                    ...orcamento,
                    comidas: [...orcamento.comidas, {id: comida.comida_id, quantidade: comida.quantidade_minima}]
                });
            }
        }
    };

    const handleQuantityChange = (comida_id: number, quantidade: number) => {
        setOrcamento(prevOrcamento => {
            if (!prevOrcamento) return prevOrcamento;
            const updatedComidas = prevOrcamento.comidas.map(comida =>
                comida.id === comida_id ? {...comida, quantidade} : comida
            );
            return {...prevOrcamento, comidas: updatedComidas};
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

    const handleToggleLogistica = (logistica: Logistica) => {
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

    const handleToggleCliente = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selectedItem = evento.clientes.find(cliente => cliente.id_cliente === selectedId);

        if (selectedItem) {
            setClientesSelecionados(selectedItem);

            setOrcamento(prevOrcamento => ({
                ...prevOrcamento,
                cliente: selectedItem.id_cliente
            }));
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setOrcamento((prevOrcamento) => prevOrcamento ? {...prevOrcamento, [name]: value} : null);
    };


    const handleSubmit = (e) => {
        e.preventDefault()
        setOrcamento({...orcamento, valor_total_comidas: valorComidaTotal, valor_total_logisticas: valorLogisticaTotal})
        console.log("SUBMIT", orcamento)
    }

    return (
        <div className='container'>
            <h2 className='text-center'>Orçamento</h2>
            <Form>
                <Row>
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            name="nome"
                            value={orcamento.nome}
                            onChange={handleChange}
                            type="text"
                            placeholder="Nome"
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Observações</Form.Label>
                        <Form.Control
                            name="observacoes"
                            value={orcamento.observacoes}
                            onChange={handleChange}
                            as="textarea"
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group className="mb-3" as={Col} controlId="formGridClientes">
                        <Form.Label>Cliente do Evento para Orçamento</Form.Label>
                        <Form.Select
                            name="cliente"
                            value={orcamento.cliente}
                            onChange={handleToggleCliente}
                        >
                            {evento.clientes.map((cliente) => (
                                <option key={cliente.id_cliente}
                                        value={cliente.id_cliente}>{cliente.nome}{`-Taxa(${cliente.taxa_financeira * 100}%)`}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridComidas">
                        <Form.Label>Comidas do Orçamento</Form.Label>
                        <div style={{
                            maxHeight: '150px',
                            overflowY: 'scroll',
                            border: '1px solid #ced4da',
                            padding: '10px'
                        }}>
                            {comidas.map((comida) => (
                                <Form.Check
                                    key={comida.comida_id}
                                    type="checkbox"
                                    label={comida.nome}
                                    value={comida.comida_id}
                                    checked={comidasSelecionadas.some(c => c.comida_id === comida.comida_id)}
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
                            {comidasSelecionadas.map((comida) => (
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
                                        value={orcamento?.comidas.find(c => c.id === comida.comida_id)?.quantidade || comida.quantidade_minima}
                                        onChange={(e) => handleQuantityChange(comida.comida_id, parseInt(e.target.value))}
                                        style={{width: '75px', marginLeft: '5px'}}
                                    />
                                </div>
                            ))}
                        </div>
                    </Form.Group>

                </Row>
                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Total R$ comidas</Form.Label>
                    <Form.Control
                        type="text"
                        value={`R$${valorComidaTotal.toFixed(2)}` || 0}
                        disabled={true}
                    />
                </Form.Group>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="formGridLogisticas">
                        <Form.Label>Logisticas do Orçamento</Form.Label>
                        <div style={{
                            maxHeight: '150px',
                            overflowY: 'scroll',
                            border: '1px solid #ced4da',
                            padding: '10px'
                        }}>
                            {logisticas.map((logistica) => (
                                <Form.Check
                                    key={logistica.id_logistica}
                                    type="checkbox"
                                    label={logistica.nome}
                                    value={logistica.id_logistica}
                                    checked={logisticasSelecionadas.includes(logistica)}
                                    onChange={() => handleToggleLogistica(logistica)}
                                />
                            ))}
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3" as={Col} controlId="formGridLogisticasSelecionadas">
                        <Form.Label>Logisticas Selecionadas</Form.Label>
                        <div style={{
                            maxHeight: '150px',
                            overflowY: 'scroll',
                            border: '1px solid #ced4da',
                            padding: '10px'
                        }}>
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

                <Form.Group as={Col} controlId="formGridNome">
                    <Form.Label>Total R$ Logistica</Form.Label>
                    <Form.Control
                        type="text"
                        value={`R$${valorLogisticaTotal.toFixed(2)} | valor * alimentação(${logisticaCidade?.alimentacao}) * dias(${evento?.qtd_dias_evento})`}
                        disabled={true}
                    />
                    {logisticasSelecionadas.map((logistica) => (
                        (!logistica.in_sp) && (
                            <p>+{logistica.nome}(Hospedagem:R${logisticaCidade?.hospedagem}, passagem:
                                R${logisticaCidade?.passagem})</p>
                        )

                    ))}
                </Form.Group>


                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    {orcamento !== null && orcamento.id_orcamento === null ? 'Criar' : 'Editar'}
                </Button>
            </Form>
        </div>
    )

}