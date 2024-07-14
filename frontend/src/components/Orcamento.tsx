import {useEffect, useState} from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

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
    observacoes: string
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setOrcamento((prevOrcamento) => prevOrcamento ? {...prevOrcamento, [name]: value} : null);
    };

    const handleSelectCliente = (e) => {
        const selectedId = parseInt(e.target.value); // Converte selectedId para um número
        const selectedItem = evento.clientes.find(cliente => cliente.id_cliente === selectedId);

        if (selectedItem) { // Verifica se selectedItem não é undefined
            setOrcamento(prevOrcamento => ({
                ...prevOrcamento,
                clientes: [...prevOrcamento.clientes, selectedItem.id_cliente]
            }));

            setEvento(prevState => ({
                ...prevState,
                clientes: prevState.clientes.filter(cliente => cliente.id_cliente !== selectedId) // Use prevState.clientes
            }));
            setClientesSelecionados(prevState => [...prevState, selectedItem]);

        } else {
            console.error(`Cliente com id ${selectedId} não encontrado.`);
        }
    };

    const handleSelectLogistica = (e) => {
        const selectedId = parseInt(e.target.value);
        const selectedItem = logisticas.find(logistica => logistica.id_logistica === selectedId);

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            logisticas: [...prevOrcamento.logisticas, selectedItem.id_logistica]
        }));
        setLogisticaSelecionada(prevState => [...prevState, selectedItem]);

        setLogisticas(logisticas.filter(logistica => logistica.id_logistica !== selectedId));
    };

    const handleSelectComida = (e) => {
        const selectedId = parseInt(e.target.value);
        const selectedItem = comidas.find(comida => comida.comida_id === selectedId);

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            comidas: [{id: selectedItem.comida_id, quantidade: selectedItem.quantidade_minima}]
        }));
        setComidasSelecionadas(prevState => [...prevState, selectedItem]);
        setComidas(comidas.filter(comida => comida.comida_id !== selectedId));
    };

    const handleSubmit = (e) => {
        console.log(e)
    }

    return (
        <div className='container'>
            <h2 className='text-center'>Orçamento</h2>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="formGridNome">
                        <Form.Label>Nome do Orçamento</Form.Label>
                        <Form.Control
                            name="descricao"
                            value={orcamento.nome}
                            onChange={handleChange}
                            placeholder="Orcamento tal"
                            type='text'
                        />
                    </Form.Group>
                    <Form.Group as={Col} className="mb-3" controlId="formGridEvento">
                        <Form.Label>Evento do Orçamento</Form.Label>
                        <Form.Control
                            name="evento"
                            disabled={true}
                            value={evento.nome}
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridClientes">
                            <Form.Label>Clientes do Evento para Orçamento</Form.Label>
                            <Form.Select
                                name="clientes"
                                onChange={handleSelectCliente}
                            >
                                {evento.clientes.map((cliente) => (
                                    <option key={cliente.id_cliente} value={cliente.id_cliente}>{cliente.nome}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridClientesSelecionados">
                            <Form.Label>Clientes Selecionados</Form.Label>
                            <div>
                                {clientesSelecionados.map((cliente) => (
                                    <p key={cliente.id_cliente}>{cliente.nome}</p>
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridLogisticas">
                            <Form.Label>Logistica do Orçamento</Form.Label>
                            <Form.Select
                                name="logisticas"
                                onChange={handleSelectLogistica}
                            >
                                {logisticas.map((logistica) => (
                                    <option key={logistica.id_logistica}
                                            value={logistica.id_logistica}>{logistica.nome}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridLogisticasSelecionadas">
                            <Form.Label>Logisticas Selecionadas</Form.Label>
                            <div>
                                {logisticaSelecionada.map((logistica) => (
                                    <p key={logistica.id_logistica}>{logistica.nome}</p>
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridComidas">
                            <Form.Label>Comidas do Orçamento</Form.Label>
                            <Form.Select
                                name="comidas"
                                onChange={handleSelectComida}
                            >
                                {comidas.map((comida) => (
                                    <option key={comida.comida_id} value={comida.comida_id}>{comida.nome}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="formGridComidasSelecionadas">
                            <Form.Label>Comidas Selecionadas</Form.Label>
                            <div>
                                {comidasSelecionadas.map((comida) => (
                                    <p key={comida.comida_id}>{comida.nome}</p>
                                ))}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Form.Group as={Col} className="mb-3" controlId="formGridObservacoes">
                        <Form.Label>Observações do Orçamento</Form.Label>
                        <Form.Control
                            name="observacoes"
                            value={orcamento.observacoes}
                            as='textarea'
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Row>
            </Form>

        </div>
    )

}