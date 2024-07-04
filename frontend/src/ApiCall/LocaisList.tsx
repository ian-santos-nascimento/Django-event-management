import csrftoken from "./CsrfToken";
import {useEffect, useState} from 'react';
import axios from 'axios';
// @ts-ignore
import LocalEvento from '../forms/LocalEvento.tsx';

const API_URL = process.env.REACT_APP_API_URL
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

export default function LocaisList({sessionId}) {
    const [locais, setLocais] = useState<Local[]>([]);
    const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);

    useEffect(() => {
        const fetchLocais = async () => {
            const response = axios.get(`${API_URL}locais/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'sessionId': sessionId
                },
                // @ts-ignore
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

    }, [sessionId]);

    const handleViewClick = (local: Local) => {
        setSelectedLocal(local);
    };

    if (selectedLocal) {
        return <LocalEvento sessionId={sessionId} local={selectedLocal}/>;
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
                    <th scope="col">Visualizar</th>
                    <th scope="col">Editar</th>
                </tr>
                </thead>
                <tbody>
                {locais.map(item =>
                    <tr>
                        <td>{item.id_local}</td>
                        <td>{item.nome}</td>
                        <td>{item.endereco}</td>
                        <td>{item.telefone}</td>
                        <td>
                            <button

                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                Visualizar
                            </button>
                        </td>
                        <td>
                            <button
                                onClick={() => handleViewClick(item)}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                            >
                                Editar
                            </button>
                        </td>
                    </tr>
                )}

                </tbody>
            </table>
        </div>
    )
}
