import {useEffect, useState} from "react";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import InputMask from 'react-input-mask';
import {FormControl} from "react-bootstrap";

import csrfToken from "../ApiCall/CsrfToken"

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

interface Local {
    id_local: string,
    nome: string,
    cidade: number
}

interface Cliente {
    id_cliente: number
    cnpj: string,
    nome: string,
}


const API_URL = process.env.REACT_APP_API_URL;

export default function Evento({evento, sessionId}) {
    const [locais, setLocais] = useState<Local[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [selectedEvento, setSelectedEvento] = useState<Evento>(evento)
    const [validated, setValidated] = useState(false);


    useEffect(() => {
            axios.get(`${API_URL}locais/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                withCredentials: true,
            }).then(response => {
                const locais = response.data as Local[];
                setLocais(locais);
                evento.local = evento.local === null ? locais[0] :evento.local
            }).catch(error => {
                console.error('Error fetching locais:', error);
            });

            axios.get(`${API_URL}clientes/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'sessionId': sessionId
                },
                withCredentials: true,
            }).then(response => {
                const clientes = response.data as Cliente[];
                setClientes(clientes);
            }).catch(error => {
                console.error('Error fetching clientes:', error);
            });

        }, [sessionId]
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
        } else {
            setValidated(true);
            await handleEventoSent();
        }
    };


    const handleEventoSent = async () => {
        try {
            if (selectedEvento.id_evento !== null) {
                await axios.put(`${API_URL}eventos/${selectedEvento.id_evento}/`, selectedEvento, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Evento updated successfully!');
            } else {
                await axios.post(`${API_URL}eventos/`, selectedEvento, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Evento created successfully!');
            }
            window.location.reload();
        } catch (error) {
            console.error('Error updating Evento:', error);
            alert('Failed to update Evento.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedEvento((prevEvento) => prevEvento ? {...prevEvento, [name]: value} : null);
    };

    const handleChangeCliente = (e) => {
        const options = e.target.options;
        const selectedClientes: number[] = []
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedClientes.push(Number(options[i].value));
            }
        }
        setSelectedEvento({
            ...selectedEvento,
            clientes: selectedClientes
        });

    }


    const handleBack = () => {
        window.location.reload()
    }

    return (
        <div className="container">
            <h2 className="text-center">Evento</h2>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            required
                            name="nome"
                            value={selectedEvento.nome}
                            onChange={handleChange}
                            type="text"
                            placeholder="Nome"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira um nome!
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCNPJ">
                        <Form.Label>Codigo</Form.Label>
                        <Form.Control
                            required
                            onChange={handleChange}
                            value={selectedEvento.codigo_evento}
                            name="codigo_evento"
                            type="number"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira um código!
                        </Form.Control.Feedback>
                    </Form.Group>

                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Descricao</Form.Label>
                        <Form.Control
                            required
                            name="descricao"
                            value={selectedEvento.descricao}
                            onChange={handleChange}
                            as="textarea"
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Observações</Form.Label>
                        <Form.Control
                            required
                            name="observacao"
                            value={selectedEvento.observacao}
                            onChange={handleChange}
                            as="textarea"
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGriPrazoPagamento">
                        <Form.Label>Local</Form.Label>
                        <Form.Select
                            required
                            name="local"
                            value={selectedEvento.local}
                            onChange={handleChange}>
                            {locais.map((local) => (
                                <option key={local.id_local} value={local.id_local}>{local.nome}</option>
                            ))}

                        </Form.Select>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridCNPJ">
                        <Form.Label>Qtd.Pessoas</Form.Label>
                        <Form.Control
                            required
                            onChange={handleChange}
                            value={selectedEvento.qtd_pessoas}
                            name="qtd_pessoas"
                            type="number"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira um número!
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridEndereco">
                        <Form.Label>Dias totais</Form.Label>
                        <Form.Control
                            name="qtd_dias_evento"
                            type='number'
                            onChange={handleChange}
                            value={selectedEvento.qtd_dias_evento}
                        />
                    </Form.Group>


                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridEndereco">
                        <Form.Label>Data de inicio</Form.Label>
                        <Form.Control
                            name="data_inicio"
                            type='date'
                            onChange={handleChange}
                            value={selectedEvento.data_inicio}
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridEndereco">
                        <Form.Label>Data final</Form.Label>
                        <Form.Control
                            required
                            name="data_fim"
                            value={selectedEvento.data_fim}
                            onChange={handleChange}
                            type="date"
                        />
                    </Form.Group>

                </Row>
                <Form.Group as={Col} controlId="formGriPrazoPagamento">
                    <Form.Label>Clientes</Form.Label>
                    <Form.Select
                        multiple={true}
                        name="clientes"
                        value={selectedEvento.clientes}
                        onChange={handleChangeCliente}>
                        {clientes.map((cliente) => (
                            <option key={cliente.id_cliente}
                                    value={cliente.id_cliente}>{cliente.nome}--{cliente.cnpj}</option>
                        ))}

                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        Escolha ao menos um cliente!
                    </Form.Control.Feedback>
                </Form.Group>

                <div className=" mt-3 d-flex justify-content-between w-100">
                    <Button variant="secondary" onClick={handleBack}
                            type="reset">
                        Retornar
                    </Button>
                    <Button variant="primary" type="submit">
                        {selectedEvento.id_evento === null ? 'Criar' : 'Editar'}
                    </Button>
                </div>

            </Form>
        </div>

    )
}