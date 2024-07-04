import { useEffect, useState } from "react";
import axios from "axios";
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import csrfToken from "../ApiCall/CsrfToken";

const API_URL = process.env.REACT_APP_API_URL;

interface Local {
    id_local: string,
    nome: string,
    endereco: string,
    telefone: string,
    email: string,
    observacoes: string,
    cidade: number
}

interface Cidade {
    id_cidade: string;
    nome: string;
    estado: string;
    taxa_deslocamento: number;
}

export default function LocalEvento({ local, sessionId }) {
    const [localState, setLocalState] = useState<Local>(local);
    const [cidades, setCidades] = useState<Cidade[]>([]);

    useEffect(() => {
        const fetchCidades = async () => {
            try {
                const response = await axios.get(`${API_URL}cidades/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });

                const cidadesData = response.data as Cidade[];
                setCidades(cidadesData);
            } catch (error) {
                console.error('Error fetching cidades:', error);
            }
        };

        fetchCidades();
    }, [sessionId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalState((prevLocal) => ({
            ...prevLocal,
            [name]: value,
        }));
    };

    const handleCityChange = (e) => {
        const { value } = e.target;
        setLocalState((prevLocal) => ({
            ...prevLocal,
            cidade: parseInt(value, 10),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`${API_URL}locais/${local.id_local}/`, localState, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                withCredentials: true,
            });
            alert('Local updated successfully!');
        } catch (error) {
            console.error('Error updating local:', error);
            alert('Failed to update local.');
        }
    };

    return (
        <div className="container">
            <h2 className="text-center">Edição da Localidade</h2>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            name="nome"
                            value={localState.nome}
                            onChange={handleChange}
                            type="text"
                            placeholder="Nome"
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            name="email"
                            value={localState.email}
                            onChange={handleChange}
                            type="text"
                        />
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridEndereco">
                    <Form.Label>Endereço</Form.Label>
                    <Form.Control
                        name="endereco"
                        value={localState.endereco}
                        onChange={handleChange}
                        placeholder="Av.Paulista nª100"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridObservacoes">
                    <Form.Label>Observações</Form.Label>
                    <Form.Control
                        name="observacoes"
                        value={localState.observacoes}
                        onChange={handleChange}
                        as="textarea"
                    />
                </Form.Group>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridTelefone">
                        <Form.Label>Telefone</Form.Label>
                        <Form.Control
                            name="telefone"
                            value={localState.telefone}
                            onChange={handleChange}
                            type="text"
                        />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCidadeNome">
                        <Form.Label>Cidade</Form.Label>
                        <Form.Select
                            name="cidade"
                            value={localState.cidade}  // Set the default value
                            onChange={handleCityChange}
                        >
                            {cidades.map(cidade => (
                                <option key={cidade.id_cidade} value={cidade.id_cidade}>
                                    {cidade.nome}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Row>

                <Button variant="primary" type="submit">
                    Editar
                </Button>
            </Form>
        </div>
    );
}
