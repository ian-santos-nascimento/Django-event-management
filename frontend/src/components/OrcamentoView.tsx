import {useEffect, useState} from "react";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import {Accordion, FormGroup} from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
// @ts-ignore
import OrcamentoList from "./OrcamentoList.tsx";

interface Logistica {
    logistica: string;
    valor: number;
    quantidade: number;

}

interface Comida {
    comida: string;
    valor: number;
    quantidade: number;
}

interface Cliente {
    id_cliente: string;
    razao_social: string;
    cnpj: string;
    inscricao_estadual: string;
    nome: string;
    telefone: string;
    prazo_pagamento: string;
    taxa_financeira: number;
    inicio_contrato: string;
    fim_contrato: string;
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
    local: number;
    clientes: number[];
}

interface Orcamento {
    logisticas: Logistica[];
    comidas: Comida[];
    cliente: Cliente;
    evento: Evento;
    nome: string;
    observacoes: string;
    valor_total: number;
    valor_total_logisticas: number;
    valor_total_comidas: number;
    valor_desconto_logisticas: number;
    valor_desconto_comidas: number;
}

const API_URL = process.env.REACT_APP_API_URL;


export default function OrcamentoView({orcamentoId, sessionId}) {
    const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
    const [showModal, setShowModal] = useState(true);

    useEffect(() => {
        const fetchOrcamento = async () => {
            try {
                const response = await axios.get(`${API_URL}orcamentos/${orcamentoId}/`);
                setOrcamento(response.data as Orcamento);
                console.log(response.data)
                setShowModal(true);
            } catch (error) {
                console.error("Error fetching orcamento:", error);
            }
        };

        fetchOrcamento();
    }, [orcamentoId]);

    if (!orcamento) {
        return <div>Loading...</div>;
    }

    const  handleBack = () => {
        //TODO fazer return da lista sem recarregar paǵina
        window.location.reload()
    }


    return (
        <div className='container'>
            <Modal
                show={showModal}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                backdrop="static"
                onHide={() => setShowModal(false)}
            >
                <Modal.Header>
                    <Modal.Title>
                        {orcamento.nome}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <FormGroup as={Col}>
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Disabled input"
                                aria-label="Disabled input example"
                                disabled
                                as='textarea'
                                value={orcamento.observacoes}
                                readOnly
                            />
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup as={Col}>
                            <Form.Label>Valor comidas</Form.Label>
                            <Form.Control
                                type="text"
                                disabled
                                value={`R$${orcamento.valor_total_comidas}`}
                                readOnly
                            />
                        </FormGroup>
                        <FormGroup as={Col}>
                            <Form.Label>Desconto comida</Form.Label>
                            <Form.Control
                                type="text"
                                disabled
                                value={`R$${orcamento.valor_desconto_comidas}`}
                                readOnly
                            />
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup as={Col}>
                            <Form.Label>Valor Logisticas</Form.Label>
                            <Form.Control
                                type="text"
                                disabled
                                value={`R$${orcamento.valor_total_logisticas}`}
                                readOnly
                            />
                        </FormGroup>
                        <FormGroup as={Col}>
                            <Form.Label>Desconto Logisticas</Form.Label>
                            <Form.Control
                                type="text"
                                disabled
                                value={`R$${orcamento.valor_desconto_logisticas}`}
                                readOnly
                            />
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup as={Col}>
                            <Form.Label>Cliente</Form.Label>
                            <Form.Control
                                type="text"
                                disabled
                                value={`${orcamento.cliente.nome} (${orcamento.cliente.taxa_financeira * 100}%)`}
                                readOnly
                            />
                        </FormGroup>
                    </Row>
                    <Row>
                        <Accordion>
                            <Accordion.Item as={'p'} eventKey="0" className='mt-3'>
                                <Accordion.Header as={'h5'}>Comidas</Accordion.Header>
                                <Accordion.Body style={{ backgroundColor: '##aab0b5;' }}>
                                    {orcamento.comidas.map(comida =>(
                                        <p>{comida.comida} (Qtd: {comida.quantidade})</p>
                                    ))}
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item as={'p'} eventKey="1" className='mt-3'>
                                <Accordion.Header
                                    as={'h5'}>Logisticas</Accordion.Header>
                                <Accordion.Body style={{ backgroundColor: '##aab0b5;' }}>
                                    {orcamento.logisticas.map(logistica =>(
                                        <p>{logistica.logistica} (Qtd: {logistica.quantidade})</p>
                                    ))}
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item as={'p'} eventKey="2" className='mt-3'>
                                <Accordion.Header style={{ backgroundColor: '#aab0b5', color: 'white' }}
                                                  as={'h5'}>Evento</Accordion.Header>
                                <Accordion.Body>
                                    <p>Nome/Coodigo: {orcamento.evento.nome}-{orcamento.evento.codigo_evento}</p>
                                    <p>Data: {orcamento.evento.data_inicio}  | {orcamento.evento.data_fim}</p>
                                    <p>Dias: {orcamento.evento.qtd_dias_evento} </p>
                                    <p>Descrição: {orcamento.evento.descricao} </p>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <div className="d-flex justify-content-between w-100">
                        <Button
                            onClick={handleBack}
                            variant="secondary">
                            Voltar
                        </Button>
                        <p>
                            <strong>Total: R${orcamento.valor_total}</strong>
                        </p>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
