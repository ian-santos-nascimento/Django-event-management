import axios from "axios";
import csrftoken from "./CsrfToken";
import {useEffect, useState} from 'react';
import {render} from "@testing-library/react";

const API_URL = process.env.REACT_APP_API_URL

interface Local {
    id_local: string,
    nome: string,
    endereco: string,
    telefone: string,
    email: string,
    observacoes: string,
    cidade: string,
}

export default function LocaisList() {
    const [locais, setLocais] = useState<Local[]>([])
    useEffect(() => {
        const fetchLocais = async () => {
            const response = await fetch(`${API_URL}locais/`);
            console.log(response)
            const locais = await response.json() as Local;
            // @ts-ignore
            setLocais(locais)
        };
        fetchLocais();

    }, []);

    console.log(locais)

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