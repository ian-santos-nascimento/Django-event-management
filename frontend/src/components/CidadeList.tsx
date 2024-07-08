import {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import csrftoken from "../ApiCall/CsrfToken";
import csrfToken from "../ApiCall/CsrfToken";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

interface Cidade {
    id_cidade: number
    nome: string,
    estado: string,
    taxa_deslocamento: number
}


export default function CidadeList({sessionId}) {
    const [cidades, setCidades] = useState<Cidade[]>([]);
    const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchCidades = async () => {
            const response = await axios.get(`${API_URL}cidades/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'sessionId': sessionId
                },
                // @ts-ignore
                credentials: 'include',
            });

            const cidades = response.data as Cidade[];
            setCidades(cidades);
        };
        fetchCidades();
    }, [sessionId]);

    const handleEditCidade = (cidade: Cidade) => {
        setSelectedCidade(cidade);
        setShowModal(true);
    };

    const handleCreateCidade = () => {
        setSelectedCidade({
            id_cidade: null,
            nome: '',
            estado: '',
            taxa_deslocamento: 0.0
        })
        setShowModal(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedCidade((prevCidade) => prevCidade ? {...prevCidade, [name]: value} : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (selectedCidade.id_cidade !== null) {
                await axios.put(`${API_URL}cidades/${selectedCidade.id_cidade}/`, selectedCidade, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Cidade updated successfully!');
            } else {
                await axios.post(`${API_URL}cidades/`, selectedCidade, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Cidade created successfully!');
            }
            window.location.reload()
        } catch (error) {
            console.error('Error updating local:', error);
            alert('Failed to update local.');
        }

    }

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCidade(null);
    };

    const handleExcluirCidade = async () => {
        try {
            await axios.delete(`${API_URL}cidades/${selectedCidade.id_cidade}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                withCredentials: true,
            });
            alert(`Cidade ${selectedCidade.nome} excluída com sucesso.`);
            window.location.reload()
        } catch (error) {
            console.error('Error updating local:', error);
            alert('Failed to update local.');
        }
        handleCloseModal()

    }


    return (
        <div className="container">
            <h2 className="text-center">Controle das Cidades</h2>
            <Button variant='primary' className='mb-3' onClick={handleCreateCidade}>Nova Cidade</Button>
            <table className="table table-success">
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Taxa Deslocamento</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {cidades.map(item =>
                    <tr key={item.id_cidade}>
                        <td>{item.id_cidade}</td>
                        <td>{item.nome}</td>
                        <td>{item.estado}</td>
                        <td>{item.taxa_deslocamento * 100}%</td>
                        <td>
                            <button
                                onClick={() => handleEditCidade(item)}
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

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalhes do cidade</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCidade && (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        name="nome"
                                        value={selectedCidade.nome}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Nome"
                                    />
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Control
                                        name="estado"
                                        placeholder='SP'
                                        maxLength={2}
                                        value={selectedCidade.estado}
                                        onChange={handleChange}
                                        type="text"
                                    />
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3" controlId="formGridEndereco">
                                <Form.Label>Taxa deslocamento (Em decimal. Ex: 0.02)</Form.Label>
                                <Form.Control
                                    name="taxa_deslocamento"
                                    value={selectedCidade.taxa_deslocamento}
                                    onChange={handleChange}
                                    placeholder="0.02"
                                />
                            </Form.Group>

                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="d-flex justify-content-between w-100">
                        <Button disabled={selectedCidade !== null && selectedCidade.id_cidade === null} variant="danger"
                                type="submit" onClick={handleExcluirCidade}>
                            Excluir
                        </Button>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            {selectedCidade !== null && selectedCidade.id_cidade === null ? 'Criar' : 'Editar'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}