import {useEffect, useState} from "react";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {fetchData, fetchDataWithId, fetchDataWithoutPagination} from "../ApiCall/ApiCall";
import {STATUS_ORCAMENTO} from "../util/OptionList"
import csrfToken from '../ApiCall/CsrfToken'
// @ts-ignore
import LogisticaOrcamentoComp from "./LogisticaOrcamentoComp.tsx";
// @ts-ignore
import CardapioOrcamentoComp from "./CardapioOrcamentoComp.tsx"
import type {OrcamentoType, EventoType, LogisticaCidadeType, LogisticaType, ComidaType} from '../types';


const API_URL = process.env.REACT_APP_API_URL;

export default function Orcamento({eventoState, orcamentoState, sessionId}) {
    const [orcamento, setOrcamento] = useState<OrcamentoType>(orcamentoState)
    const [comidas, setComidas] = useState<ComidaType[]>([])
    const [comidasSelecionadas, setComidasSelecionadas] = useState<ComidaType[]>([]);
    const [logisticas, setLogisticas] = useState<LogisticaType[]>([])
    const [logisticaCidade, setLogisticaCidade] = useState<LogisticaCidadeType>()
    const [logisticasSelecionadas, setLogisticasSelecionadas] = useState<LogisticaType[]>([])
    const [evento, setEvento] = useState<EventoType>(eventoState)
    const [valorLogisticaTotal, setValorLogisticaTotal] = useState(orcamentoState.valor_total_logisticas | 0)
    const [filter, setFilter] = useState('');
    const [filterLogistica, setFilterLogistica] = useState('');


      useEffect(() => {
        setOrcamento(orcamentoState);
    }, [orcamentoState]);

    useEffect(() => {
        getModels();
    }, []);

    useEffect(() => {
        if (!evento.clientes || evento) {
            const eventoResponse = async () => {
                const response = await fetchDataWithId('eventos', eventoState.id_evento)
                setEvento(response.data as EventoType)
                setOrcamento({...orcamento, evento: eventoState.id_evento})
            }
            eventoResponse()
        }
    }, []);

    useEffect(() => {
        if (evento && evento.local && evento.local.cidade) {
            getLogisticaCidade()
            setOrcamento({...orcamento, cliente: evento.clientes[0]})
        }
    }, [evento]);


    const filteredLogisticas = logisticas.filter(logistica =>
        logistica.nome.toLowerCase().includes(filterLogistica.toLowerCase())
    );


    async function getLogisticaCidade() {
        if (evento && evento.local && evento.local.cidade !== null) {
            try {
                const response = await fetchDataWithId('logistica-cidade', evento.local.cidade);
                setLogisticaCidade(response.data as LogisticaCidadeType);
            } catch (e) {
                console.error('Error fetching LogisticaCidade:', e);
            }
        }
    }

    async function getModels() {
        const logisticasResponse = await fetchDataWithoutPagination('logisticasWP', csrfToken, sessionId);
        setLogisticas(logisticasResponse.data as LogisticaType[]);

        const comidasResponse = await fetchDataWithoutPagination('comidasWP', csrfToken, sessionId);
        setComidas(comidasResponse.data as ComidaType[]);

    }


    const handleToggleCliente = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        const selectedItem = evento.clientes.find(cliente => cliente.id_cliente === selectedId);

        if (selectedItem) {
            setOrcamento(prevOrcamento => ({
                ...prevOrcamento,
                cliente: selectedItem
            }));
        }
    };

    const handleChange = (e: { target: { name: string; value: any } }) => {
        const {name, value} = e.target;

        setOrcamento(prevOrcamento => ({
            ...prevOrcamento,
            [name]: value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}orcamentos-create/`, orcamento, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                withCredentials: true,
            })
            alert('Orcamento created successfully!');
        } catch (exception) {
            console.log("Error tentando salvar orcamento", orcamento,
                '\n erro:', exception)
            alert('Não foi possível salvar o Orçamento')
        }
        window.location.reload()
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
                    <Form.Group as={Col} controlId="formGridStatus">
                        <Form.Label>Status do Orçamento</Form.Label>
                        <Form.Select
                            name="status"
                            value={orcamento.status}
                            onChange={handleChange}
                        >
                            {STATUS_ORCAMENTO.map((status, index) => (
                                <option key={index} value={status.value}>
                                    {status.name}
                                </option>
                            ))}
                        </Form.Select>
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
                            value={orcamento?.cliente?.id_cliente}
                            onChange={handleToggleCliente}
                        >
                            {evento.clientes.map((cliente) => (
                                <option key={cliente.id_cliente}
                                        value={cliente.id_cliente}>{cliente.nome}{`-Taxa(${cliente.taxa_financeira * 100}%)`}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Row>

                <CardapioOrcamentoComp cardapio={comidas} setCardapio={setComidas} selectedCardapio={comidasSelecionadas} setOrcamento={setOrcamento}
                                       orcamento={orcamento} evento={evento} filter={filter} setSelectedCardapio={setComidasSelecionadas}/>

                <LogisticaOrcamentoComp orcamento={orcamento} setOrcamento={setOrcamento}
                                        logisticaCidade={logisticaCidade}
                                        setValorLogisticaTotal={setValorLogisticaTotal}
                                        setFilterLogistica={setFilterLogistica} filteredLogisticas={filteredLogisticas}
                                        handleChange={handleChange} evento={evento} logisticas={logisticas}
                                        valorLogisticaTotal={valorLogisticaTotal} filterLogistica={filterLogistica}
                                        logisticasSelecionadas={logisticasSelecionadas} setLogisticas={setLogisticas}
                                        setLogisticasSelecionadas={setLogisticasSelecionadas}
                />

                <Button variant="primary" type="submit" onClick={handleSubmit}>
                    {orcamento !== null && orcamento.id_orcamento === null ? 'Criar' : 'Editar'}
                </Button>
            </Form>
        </div>
    )

}