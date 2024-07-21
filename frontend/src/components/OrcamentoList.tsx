import axios from "axios";
import {useEffect, useState} from "react";
import csrfToken from "../ApiCall/CsrfToken"
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
// @ts-ignore
import Evento from "./Evento.tsx"
import Orcamento from './Orcamento.tsx'

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

interface Evento {
    id_evento: number,
    codigo_evento: number,
    nome: string,
    descricao: string,
    observacao: string,
    qtd_dias_evento: number,
    qtd_pessoas: number,
    data_inicio: string,
    data_fim: string,
    local: number,
    clientes: number[]

}

interface Orcamento {
    id_orcamento: number,
    nome: string,
    evento: number,
    cliente: number,
    comidas: number[],
    logisticas: number[],
    valor_total: number,
    valor_total_logisticas: number,
    valor_total_comidas: number,
    valor_desconto_logisticas: number,
    valor_desconto_comidas: number,
}

export default function EventoList({sessionId}) {
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
    const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento>(null)
    const [eventos, setEventos] = useState<Evento[]>([])
    const [selectedEvento, setSelectedEvento] = useState<Evento>(null)
    const [showModal, setShowModal] = useState(false)
    const [showOrcamento, setShowOrcamento] = useState(false)


    useEffect(() => {
        const fetchOrcamentos = async () => {
            const response = await axios.get(`${API_URL}orcamentos/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                // @ts-ignore
                credentials: 'include',
            });

            const orcamentos = response.data as Orcamento[];
            setOrcamentos(orcamentos);
        };
        const fetchEventos = async () => {
            const response = await axios.get(`${API_URL}eventos/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                // @ts-ignore
                credentials: 'include',
            });

            const eventos = response.data as Evento[];
            setEventos(eventos);
            setSelectedEvento(eventos[0])
        };
        fetchEventos();
        fetchOrcamentos();
    }, [sessionId]);

    const handleCreateOrcamento = () => {
        setShowModal(true)
        setSelectedOrcamento({
            id_orcamento: null,
            nome: '',
            evento: null,
            cliente: null,
            comidas: [],
            logisticas: [],
            valor_total: 0,
        })
    }

    const handleViewOrcamento = (orcamento) => {
        setSelectedOrcamento(orcamento)
        setShowModal(true)

    }

    const handleCloseModalEvento = () => {
        setShowModal(false)
        setSelectedEvento(null)
    }

    const handleEditOrcamento = (orcamento) => {
        setSelectedOrcamento(orcamento)
    }

    const handleSelectEventoButton = () => {
        setShowOrcamento(true)
    }


    const handleSelectEvento = (e) => {
        const eventoId = e.target.value;
        const selectedEvento = eventos.find(evento => evento.id_evento === parseInt(eventoId));
        setSelectedEvento(selectedEvento);
    };

    if (showOrcamento)
        return <Orcamento eventoState={selectedEvento} sessionId={sessionId}/>


    return (
        <div className="container">
            <h2 className="text-center">Controle de Orçamentos</h2>
            <Button variant='primary' className='mb-3' onClick={handleCreateOrcamento}>Novo Orcamento</Button>
            <table className="table table-success">
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Desconto Cardápio</th>
                    <th scope="col">Desconto Logist.</th>
                    <th scope="col">Visualizar</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {orcamentos.map(item =>
                    <tr key={item.id_orcamento}>
                        <td>{item.id_orcamento}</td>
                        <td>{item.nome}</td>
                        <td>R${item.valor_total}</td>
                        <td>R${item.valor_desconto_comidas}</td>
                        <td>R${item.valor_desconto_logisticas}</td>
                    </tr>
                )}
                </tbody>
            </table>
            <Modal show={showModal} size="lg" onHide={handleCloseModalEvento}>
                <Modal.Header closeButton>
                    <Modal.Title>Escolha o Evento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrcamento && (
                        <div>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Evento</Form.Label>
                                    <Form.Select
                                        name="nome"
                                        value={selectedEvento.id_evento}
                                        onChange={handleSelectEvento}
                                    >
                                        {eventos.map((evento) => (
                                            <option key={evento.id_evento} value={evento.id_evento}>
                                                {evento.nome}--{evento.codigo_evento}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                            </Row>
                            <Modal.Footer className="modal-footer-custom">
                                <div className="d-flex w-100">
                                    <Button
                                        variant="primary"
                                        onClick={handleSelectEventoButton}>
                                        Selecionar
                                    </Button>

                                </div>

                            </Modal.Footer>
                        </div>
                    )}
                </Modal.Body>

            </Modal>

        </div>


    )
}