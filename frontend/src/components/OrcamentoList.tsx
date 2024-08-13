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
// @ts-ignore
import Orcamento from './Orcamento.tsx'
// @ts-ignore
import OrcamentoView from "./OrcamentoView.tsx";
import {fetchData} from "../ApiCall/ApiCall";
import {InputGroup} from "react-bootstrap";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";


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

export default function OrcamentoList({sessionId}) {
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
    const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento>(null)
    const [eventos, setEventos] = useState<Evento[]>([])
    const [selectedEvento, setSelectedEvento] = useState<Evento>(null)
    const [showModal, setShowModal] = useState(false)
    const [showOrcamento, setShowOrcamento] = useState(false)
    const [viewOrcamento, setViewOrcamento] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const fetchOrcamentos = async () => {
            const response = await fetchData('orcamentos', currentPage,searchQuery,  csrfToken, sessionId)
            const orcamentos = response.data as Orcamento[];
            setOrcamentos(orcamentos);
            setTotalPages(Math.ceil(response.count / 10));

        };
        fetchOrcamentos();
    }, [sessionId, currentPage, searchQuery]);


    useEffect(() => {
        const fetchEventos = async () => {
            const response = await fetchData('eventos', currentPage, csrfToken, sessionId)
            const eventos = response.data as Evento[];
            setEventos(eventos);
            setSelectedEvento(eventos[0])
        };
        fetchEventos();
    }, [sessionId, currentPage])

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

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
            valor_desconto_logisticas: 0,
            valor_total_comidas: 0,
            valor_desconto_comidas: 0,
            valor_total_logisticas: 0,
        })
    }

    const handleViewOrcamento = (orcamento) => {
        setSelectedOrcamento(orcamento)
        setViewOrcamento(true)

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

    if (viewOrcamento)
        return <OrcamentoView orcamentoId={selectedOrcamento.id_orcamento} sessionId={sessionId}/>

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchClick = () => {
        setSearchQuery(searchTerm);
    };

    const handleClearSearch = () => {
        setSearchQuery('')
        setSearchTerm('')

    }

    return (
        <div className="container">
            <h2 className="text-center">Controle de Orçamentos</h2>
            <div className=" justify-content-between w-100">
                <Button variant='primary' className='mb-3' onClick={handleCreateOrcamento}>Novo Orcamento</Button>
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Buscar nome/nome do evento/nome do cliente..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button
                        type='button'
                        variant="outline-primary" title='Buscar'
                        onClick={handleSearchClick}>
                        <FontAwesomeIcon icon={faSearch}/>
                    </Button>
                    {searchTerm && (
                        <Button
                            type='button'
                            variant="outline-danger" title='Limpar filtro'
                            onClick={handleClearSearch}>
                            <FontAwesomeIcon icon={faTimes}/>
                        </Button>
                    )}
                </InputGroup>
            </div>
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
                        <td>
                            <button
                                onClick={() => handleViewOrcamento(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="search"/>
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleEditOrcamento(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="edit"/>
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Anterior
                </button>
                <span> Página {currentPage} de {totalPages} </span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Próxima
                </button>
            </div>
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
                                        value={selectedEvento?.id_evento}
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