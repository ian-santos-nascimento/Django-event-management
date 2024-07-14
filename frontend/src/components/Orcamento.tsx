import {useEffect, useState} from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

interface Orcamento {
    id_orcamento: number,
    nome: string,
    evento: number,
    clientes: number[],
    logisticas: number[],
    comidas: [{
        id: number,
        quantidade: number
    }]
    observacoes: string,
    valor_total:number
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
    const [logisticaSelecionada, setLogisticaSelecionada] = useState<Logistica[]>([])
    const [clientesSelecionados, setClientesSelecionados] = useState<Cliente[]>([])
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
            getLogisticaCidade();
        } else {
            console.log("Evento not ready yet:", evento);
        }
    }, [evento]);

    async function getLogisticaCidade() {
        if (evento && evento.local && evento.local.cidade !== null) {
            try {
                console.log("Fetching LogisticaCidade for cidade:", evento.local.cidade);
                const response = await axios.get(`${API_URL}logistica-cidade/${evento.local.cidade}`);
                setLogisticaCidade(response.data as LogisticaCidade);
                console.log("Fetched LogisticaCidade:", response.data);
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

            const eventoResponse = await axios.get(`${API_URL}eventos/${eventoId}`);
            setEvento(eventoResponse.data as Evento);
            console.log("EVENTOSET", evento)
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

    const handleToggleLogistica = (logistica: Logistica) => {
        if (logisticaSelecionada.includes(logistica)) {
            // Remover da lista de selecionados e adicionar de volta à lista de disponíveis
            setLogisticaSelecionada(logisticaSelecionada.filter(l => l !== logistica));
            setLogisticas([...logisticas, logistica]);

            if (orcamento) {
                const updatedLogisticas = orcamento.logisticas.filter(id => id !== logistica.id_logistica);
                setOrcamento({...orcamento, logisticas: updatedLogisticas});
            }
        } else {
            // Adicionar à lista de selecionados e remover da lista de disponíveis
            setLogisticaSelecionada([...logisticaSelecionada, logistica]);
            setLogisticas(logisticas.filter(l => l !== logistica));

            if (orcamento) {
                setOrcamento({...orcamento, logisticas: [...orcamento.logisticas, logistica.id_logistica]});
            }
        }
    };

    const handleToggleCliente = (cliente: Cliente) => {
        if (clientesSelecionados.includes(cliente)) {
            // Cliente desmarcado: remover da lista de selecionados e adicionar de volta à lista de clientes do evento
            setClientesSelecionados(clientesSelecionados.filter(c => c !== cliente));

            if (orcamento) {
                const updatedClientes = orcamento.clientes.filter(id => id !== cliente.id_cliente);
                setOrcamento({...orcamento, clientes: updatedClientes});
            }

            setEvento(prevEvento => ({
                ...prevEvento,
                clientes: [...prevEvento.clientes, cliente]
            }));
        } else {
            // Cliente marcado: adicionar à lista de selecionados e remover da lista de clientes do evento
            setClientesSelecionados([...clientesSelecionados, cliente]);

            if (orcamento) {
                setOrcamento({...orcamento, clientes: [...orcamento.clientes, cliente.id_cliente]});
            }

            setEvento(prevEvento => ({
                ...prevEvento,
                clientes: prevEvento.clientes.filter(c => c.id_cliente !== cliente.id_cliente)
            }));
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setOrcamento((prevOrcamento) => prevOrcamento ? {...prevOrcamento, [name]: value} : null);
    };


    const handleSubmit = (e) => {
        e.preventDefault()
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
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridComidas">
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
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridComidasSelecionadas">
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
                                            label={comida.nome}
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
                        <Form.Group as={Col} controlId="formGridNome">
                            <Form.Label>Observações</Form.Label>
                            <Form.Control
                                name="observacoes"
                                disabled={true}
                                value={orcamento.}
                                onChange={handleChange}
                                type="number"
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridLogisticas">
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
                                        checked={logisticaSelecionada.includes(logistica)}
                                        onChange={() => handleToggleLogistica(logistica)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridLogisticasSelecionadas">
                            <Form.Label>Logisticas Selecionadas</Form.Label>
                            <div style={{
                                maxHeight: '150px',
                                overflowY: 'scroll',
                                border: '1px solid #ced4da',
                                padding: '10px'
                            }}>
                                {logisticaSelecionada.map((logistica) => (
                                    <Form.Check
                                        key={logistica.id_logistica}
                                        type="checkbox"
                                        label={logistica.nome}
                                        value={logistica.id_logistica}
                                        checked={true}
                                        onChange={() => handleToggleLogistica(logistica)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridClientes">
                            <Form.Label>Clientes do Evento para Orçamento</Form.Label>
                            <div style={{
                                maxHeight: '150px',
                                overflowY: 'scroll',
                                border: '1px solid #ced4da',
                                padding: '10px'
                            }}>
                                {evento.clientes.map((cliente) => (
                                    <Form.Check
                                        key={cliente.id_cliente}
                                        type="checkbox"
                                        label={cliente.nome}
                                        value={cliente.id_cliente}
                                        checked={clientesSelecionados.includes(cliente)}
                                        onChange={() => handleToggleCliente(cliente)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridClientesSelecionados">
                            <Form.Label>Clientes Selecionados</Form.Label>
                            <div style={{
                                maxHeight: '150px',
                                overflowY: 'scroll',
                                border: '1px solid #ced4da',
                                padding: '10px'
                            }}>
                                {clientesSelecionados.map((cliente) => (
                                    <Form.Check
                                        key={cliente.id_cliente}
                                        type="checkbox"
                                        label={cliente.nome}
                                        value={cliente.id_cliente}
                                        checked={true}
                                        onChange={() => handleToggleCliente(cliente)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    {orcamento !== null && orcamento.id_orcamento === null ? 'Criar' : 'Editar'}
                </Button>
            </Form>
        </div>
    )

}