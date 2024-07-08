import {useEffect, useState} from "react";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import InputMask from 'react-input-mask';
import {FormControl} from "react-bootstrap";

interface Cliente {
    id_cliente: string,
    razao_social: string,
    cnpj: string,
    inscricao_estadual: string,
    nome: string,
    telefone: string,
    endereco: {
        "id_endereco": number,
        "cep": string,
        "endereco": string,
        "bairro": string,
        "cidade": string,
        "estado": string,
        "numero": string,
        "complemento": string
    },
    prazo_pagamento: string,
    taxa_financeira: number,
    inicio_contrato: string,
    fim_contrato: string,
}

const API_URL = process.env.REACT_APP_API_URL;

export default function Cliente({cliente, csrfToken, sessionId, setSelectedClienteList}) {
    const [selectedCliente, setSelectedCliente] = useState<Cliente>(cliente);
    const [validated, setValidated] = useState(false);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
        } else {
            setValidated(true);
            await handleClienteSent();
        }
    };


    const handleClienteSent = async () => {
        try {
            if (selectedCliente?.id_cliente !== null) {
                await axios.put(`${API_URL}clientes/${selectedCliente.id_cliente}/`, selectedCliente, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Cliente updated successfully!');
            } else {
                await axios.post(`${API_URL}clientes/`, selectedCliente, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'sessionId': sessionId
                    },
                    withCredentials: true,
                });
                alert('Cliente created successfully!');
            }
            window.location.reload();
        } catch (error) {
            console.error('Error updating Cliente:', error);
            alert('Failed to update Cliente.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setSelectedCliente((prevCliente) => prevCliente ? {...prevCliente, [name]: value} : null);
    };

    const handleChangeEndereco = (e) => {
        const {name, value} = e.target;
        const key = name.split('_')[0]
        const subValue = name.split('_')[1]
        setSelectedCliente(prevCliente => ({
            ...prevCliente,
            [key]: {
                ...prevCliente.endereco,
                [subValue]: value
            }
        }));
    }

    const handlePrazoPagamento = (e) => {
        const {value} = e.target;
        const dias = value.split(" ")[0];
        setSelectedCliente(prevState => prevState ? {
            ...prevState,
            prazo_pagamento: value,
            taxa_financeira: (Number(dias) / 30) * 0.03 // Transforma os dias em mês e depois aplica 3% ao mês
        } : null);
    };

    const handleBack = () => {
        setSelectedClienteList(null)
    }

    return (
        <div className="container">
            <h2 className="text-center">Controle de Clientes</h2>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridNome">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            required
                            name="nome"
                            value={selectedCliente.nome}
                            onChange={handleChange}
                            type="text"
                            placeholder="Nome"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira um nome!
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCNPJ">
                        <Form.Label>CNPJ</Form.Label>
                        <InputMask
                            mask="99.999.999/9999-99"
                            value={selectedCliente.cnpj}
                            onChange={handleChange}
                        >
                            {() => <Form.Control
                                required
                                name="cnpj"
                                placeholder='XX.XXX.XXX/0001-XX'
                                maxLength={18}
                                type="text"
                            />}
                        </InputMask>
                        <Form.Control.Feedback type="invalid">
                            Insira um CNPJ válido!
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridTelefone">
                        <Form.Label>Telefone de contato</Form.Label>
                        <InputMask
                            mask="(99) 99999-9999"
                            value={selectedCliente.telefone}
                            onChange={handleChange}
                        >
                            {() => <Form.Control
                                required
                                name="telefone"
                                placeholder='(XX) XXXXX-XXXX'
                                type="text"
                            />}
                        </InputMask>
                        <Form.Control.Feedback type="invalid">
                            Informe um número para contato!
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridInscricaoEstadual">
                        <Form.Label>Inscrição Estadual</Form.Label>
                        <Form.Control
                            required
                            name="inscricao_estadual"
                            placeholder='620.222.867.565'
                            value={selectedCliente.inscricao_estadual}
                            onChange={handleChange}
                            type="text"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira a inscrição estadual!
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridRazaoSocial">
                        <Form.Label>Razao social</Form.Label>
                        <Form.Control
                            required
                            name="razao_social"
                            value={selectedCliente.razao_social}
                            onChange={handleChange}
                            type="text"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira a razão social!
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGriPrazoPagamento">
                        <Form.Label>Prazo de pagamento</Form.Label>
                        <Form.Select
                            required
                            name="taxa_deslocamento"
                            value={selectedCliente.prazo_pagamento}
                            onChange={handlePrazoPagamento}>
                            <option value="30 Dias">30 Dias</option>
                            <option value="60 Dias">60 Dias</option>
                            <option value="90 Dias">90 Dias</option>
                            <option value="120 Dias">120 Dias</option>
                            <option value="150 Dias">150 Dias</option>
                            <option value="180 Dias">180 Dias</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Escolha o prazo de pagamento!
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridEndereco">
                        <Form.Label>Taxa financeira </Form.Label>
                        <Form.Control
                            name="taxa_deslocamento"
                            disabled={true}
                            value={selectedCliente.taxa_financeira * 100 + '%'}
                            placeholder="0.00"
                        />
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridInicioContrato">
                        <Form.Label>Data do Inicio do Contrato</Form.Label>
                        <Form.Control
                            required
                            name="inicio_contrato"
                            value={selectedCliente.inicio_contrato}
                            onChange={handleChange}
                            type="date"
                        />
                        <Form.Control.Feedback type="invalid">
                            Escolha a data de início do Contrato!
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridFimContrato">
                        <Form.Label>Data do Fim do Contrato</Form.Label>
                        <Form.Control
                            required
                            name="fim_contrato"
                            value={selectedCliente.fim_contrato}
                            onChange={handleChange}
                            type="date"
                        />
                        <Form.Control.Feedback type="invalid">
                            Escolha a data de fim do Contrato!
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <hr/>
                <h3 className='text-center'>Endereço do Cliente</h3>
                <Row classNme='mb-3'>
                    <Form.Group as={Col} controlId="formGridEndereco">
                        <Form.Label>Endereço</Form.Label>
                        <Form.Control
                            required
                            name="endereco_endereco"
                            value={selectedCliente.endereco.endereco}
                            onChange={handleChangeEndereco}
                            placeholder='Av. Paulista'
                            type="text"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira o Endereço
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridNumero">
                        <Form.Label>Numero</Form.Label>
                        <Form.Control
                            required
                            name="endereco_numero"
                            value={selectedCliente.endereco.numero}
                            onChange={handleChangeEndereco}
                            type="text"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira o Número do Endereço!
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridEnderecoCep">
                        <Form.Label>CEP</Form.Label>
                        <InputMask
                            mask='99999-999'
                            value={selectedCliente.endereco.cep}
                            onChange={handleChangeEndereco}
                        >
                            {() =>
                                <Form.Control required
                                             name="endereco_cep"
                                             type="text"/>
                            }
                        </InputMask>
                        <Form.Control.Feedback type="invalid">
                            Insira o CEP!
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>
                <Row>
                    <Form.Group as={Col} controlId="formGridCidade">
                        <Form.Label>Cidade</Form.Label>
                        <Form.Control
                            required
                            name="endereco_cidade"
                            placeholder='Belo Horizonte'
                            value={selectedCliente.endereco.cidade}
                            onChange={handleChangeEndereco}
                            type="text"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira a Cidade!
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridBairro">
                        <Form.Label>Bairro</Form.Label>
                        <Form.Control
                            required
                            name="endereco_bairro"
                            placeholder='Bairro tal tal'
                            value={selectedCliente.endereco.bairro}
                            onChange={handleChangeEndereco}
                            type="text"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira o Bairo!
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridBairro">
                        <Form.Label>Estado</Form.Label>
                        <Form.Control
                            required
                            name="endereco_estado"
                            maxLength={2}
                            placeholder='AC'
                            value={selectedCliente.endereco.estado}
                            onChange={handleChangeEndereco}
                            type="text"
                        />
                        <Form.Control.Feedback type="invalid">
                            Insira o estado!
                        </Form.Control.Feedback>
                    </Form.Group>
                </Row>

                <Form.Group as={Col} controlId="formGridComplemento">
                    <Form.Label>Complemento</Form.Label>
                    <Form.Control
                        required
                        maxLength={150}
                        name="endereco_complemento"
                        value={selectedCliente.endereco.complemento}
                        onChange={handleChangeEndereco}
                        type="text"
                    />
                    <Form.Control.Feedback type="invalid">
                        Insira o estado!
                    </Form.Control.Feedback>
                </Form.Group>


                <div className=" mt-3 d-flex justify-content-between w-100">
                    <Button variant="secondary" onClick={handleBack}
                            type="reset">
                        Retornar
                    </Button>
                    <Button variant="primary" type="submit">
                        {selectedCliente.id_cliente === null ? 'Criar' : 'Editar'}
                    </Button>
                </div>

            </Form>
        </div>

    )
}