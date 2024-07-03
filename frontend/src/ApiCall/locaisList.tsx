import csrftoken from "./CsrfToken";
import {useEffect, useState} from 'react';
import {render} from "@testing-library/react";
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL
const COOKIE = csrftoken
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
    cidade: string,
}

export default function LocaisList({sessionId}) {
    const [locais, setLocais] = useState<Local[]>([])
    try {

        useEffect(() => {
            const fetchLocais = async () => {
                const response = axios.get(`${API_URL}locais/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                        'sessionId': sessionId
                    },
                    credentials: 'include',
                }).then(function (responseData) {
                    const locais = responseData.data as Local[]
                    console.log("LOCALLISt", locais)
                    // @ts-ignore
                    setLocais(locais)
                })
                console.log(response)
                setLocais(locais)
            };
            fetchLocais();

        }, []);
        console.log(locais)
    } catch (error) {
        console.log(error)
    }


    return (
        <div className="container">
            <h2 className="text-center"> Controle de Locais Evento</h2>
            <table className="table table-success">
                <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Endereco</th>
                    <th scope="col">Telefone</th>
                    <th scope="col">Cidade</th>
                    <th scope="col">Visualizar</th>
                </tr>
                </thead>
                <tbody>
                {locais.map(item =>
                    <tr>
                        <td>{item.id_local}</td>
                        <td>{item.nome}</td>
                        <td>{item.endereco}</td>
                        <td>{item.telefone}</td>
                        <td>{item.cidade}</td>
                        <td>
                            <button type="button" className="btn btn-sm btn-outline-primary">
                                <i className="fa fa-search" title="Visualizar local"></i></button>
                        </td>
                    </tr>
                )}

                </tbody>
            </table>
        </div>
    )
}