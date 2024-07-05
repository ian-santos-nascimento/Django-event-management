import {useEffect, useState} from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
// @ts-ignore
import LocalEvento from '../forms/LocalEvento.tsx';
import csrftoken from "../ApiCall/CsrfToken";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

interface Local {
    id_local: string,
    nome: string,
    endereco: string,
    telefone: string,
    email: string,
    observacoes: string,
    cidade: number
}

export default function LocalList({sessionId}) {
    const [locais, setLocais] = useState<Local[]>([]);
    const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchLocais = async () => {
            const response = await axios.get(`${API_URL}locais/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'sessionId': sessionId
                },
                // @ts-ignore
                credentials: 'include',
            });

            const locais = response.data as Local[];
            setLocais(locais);
        };
        fetchLocais();
    }, [sessionId]);

    const handleEditLocal = (local: Local) => {
        setSelectedLocal(local);
    };

    const handleViewLocal = (local: Local) => {
        setSelectedLocal(local);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLocal(null);
    };

    if (selectedLocal && !showModal) {
        return <LocalEvento sessionId={sessionId} local={selectedLocal}/>;
    }

    return (
        <div className="container">
            <h2 className="text-center">Controle de Locais Evento</h2>
            <table className="table table-success">
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Endereco</th>
                    <th scope="col">Telefone</th>
                    <th scope="col">Visualizar</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {locais.map(item =>
                    <tr key={item.id_local}>
                        <td>{item.id_local}</td>
                        <td>{item.nome}</td>
                        <td>{item.endereco}</td>
                        <td>{item.telefone}</td>
                        <td>
                            <button
                                onClick={() => handleViewLocal(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="search" />
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleEditLocal(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                <FontAwesomeIcon icon="edit" />
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes do Local</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLocal && (
                        <div>
                            <p><strong>Nome:</strong> {selectedLocal.nome}</p>
                            <p><strong>Endereço:</strong> {selectedLocal.endereco}</p>
                            <p><strong>Telefone:</strong> {selectedLocal.telefone}</p>
                            <p><strong>Email:</strong> {selectedLocal.email}</p>
                            <p><strong>Observações:</strong> {selectedLocal.observacoes}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
