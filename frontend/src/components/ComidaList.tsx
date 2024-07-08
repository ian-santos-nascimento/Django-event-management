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

interface Comida {
    comida_id: number
    nome: string,
    descricao: string,
    tipo: string,
    valor: number,
    quantidade_minima: number,
}


export default function CidadeList({sessionId}) {
    const [comidas, setCidades] = useState<Comida[]>([]);
    const [selectedComida, setSelectedComida] = useState<Comida | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchCidades = async () => {
            const response = await axios.get(`${API_URL}comidas/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'sessionId': sessionId
                },
                // @ts-ignore
                credentials: 'include',
            });

            const comidas = response.data as Comida[];
            setCidades(comidas);
        };
        fetchCidades();
    }, [sessionId]);

    const handleEditComida = (comida: Comida) => {
        setSelectedComida(comida);
        setShowModal(true);
    };

    const handleCreateCidade = () => {
        setSelectedComida({
            comida_id: null,
            nome: '',
            descricao: '',
            tipo: '',
            valor: 0.0,
            quantidade_minima: 0
        })
        setShowModal(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedComida((prevComida) => prevComida ? {...prevComida, [name]: value} : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (selectedComida.comida_id !== null) {
                await axios.put(`${API_URL}comidas/${selectedComida.comida_id}/`, selectedComida, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Comida updated successfully!');
            } else {
                await axios.post(`${API_URL}comidas/`, selectedComida, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Comida created successfully!');
            }
            window.location.reload()
        } catch (error) {
            console.error('Error updating comida:', error);
            alert('Failed to update comida.');
        }

    }

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedComida(null);
    };

    const handleExcluirCidade = async () => {
        try {
            await axios.delete(`${API_URL}comidas/${selectedComida.comida_id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                withCredentials: true,
            });
            alert(`Comida ${selectedComida.nome} excluída com sucesso.`);
            window.location.reload()
        } catch (error) {
            console.error('Error updating comida:', error);
            alert('Failed to update comida.');
        }
        handleCloseModal()

    }


    return (
        <div className="container">
            <h2 className="text-center">Controle das comidas</h2>
            <Button variant='primary' className='mb-3' onClick={handleCreateCidade}>Nova Comida</Button>
            <table className="table table-success">
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Descricao</th>
                    <th scope="col">Qtd.Minima</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {comidas.map(item =>
                    <tr key={item.comida_id}>
                        <td>{item.comida_id}</td>
                        <td>{item.nome}</td>
                        <td>{item.descricao.slice(0,50)}</td>
                        <td>{item.quantidade_minima}</td>
                        <td>{item.tipo}</td>
                        <td>R${item.valor}</td>
                        <td>
                            <button
                                onClick={() => handleEditComida(item)}
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
                    <Modal.Title>Detalhes do Comida</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedComida && (
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} controlId="formGridNome">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control
                                        name="nome"
                                        value={selectedComida.nome}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Nome"
                                    />
                                </Form.Group>

                            </Row>
                            <Row>
                                <Form.Group as={Col} controlId="formGridQtdMinima">
                                    <Form.Label>Quantidade minima</Form.Label>
                                    <Form.Control
                                        name="quantidade_minima"
                                        placeholder='4'
                                        value={selectedComida.quantidade_minima}
                                        onChange={handleChange}
                                        type="number"
                                    />
                                </Form.Group>

                                <Form.Group as={Col} controlId="formGridEValor">
                                    <Form.Label>Valor</Form.Label>
                                    <Form.Control
                                        name="valor"
                                        placeholder='30,50'
                                        value={selectedComida.valor}
                                        onChange={handleChange}
                                        type="number"
                                    />
                                </Form.Group>
                            </Row>

                            <Form.Group className="mb-3" controlId="formGridDescricao">
                                <Form.Label>Descricao</Form.Label>
                                <Form.Control
                                    name="descricao"
                                    value={selectedComida.descricao}
                                    onChange={handleChange}
                                    placeholder="Comida feita pelo chef"
                                    type='text'
                                />
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGriPrazoPagamento">
                                <Form.Label>Tipo de comida</Form.Label>
                                <Form.Select
                                    required
                                    name="tipo"
                                    value={selectedComida.tipo}
                                    onChange={handleChange}>
                                    <option value="Doces">Doces</option>
                                    <option value="Acompanhamentos">Acompanhamentos</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Salgados">Salgados</option>
                                    <option value="Almoço">Almoço</option>
                                    <option value="Embalagem">Embalagem</option>
                                    <option value="Lanches">Lanches</option>
                                    <option value="Terceirizado">Terceirizado</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Escolha o tipo da comida
                                </Form.Control.Feedback>
                            </Form.Group>

                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="d-flex justify-content-between w-100">
                        <Button disabled={selectedComida !== null && selectedComida.comida_id === null} variant="danger"
                                type="submit" onClick={handleExcluirCidade}>
                            Excluir
                        </Button>
                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            {selectedComida !== null && selectedComida.comida_id === null ? 'Criar' : 'Editar'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}