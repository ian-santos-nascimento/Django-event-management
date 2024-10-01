// Login.js

import React, {useState} from 'react';
import axios from 'axios';
import csrftoken from '../ApiCall/CsrfToken'; // Import the CSRF token utility
const API_URL = process.env.REACT_APP_API_URL
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.withXSRFToken = true
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const login = axios.create({baseURL: API_URL})

const Login = ({setAuthenticated, setSessionId}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const responseData = await login.post('login/', {
                    username: username,
                    password: password
                },
                {
                    headers: {
                        'X-CSRFToken': csrftoken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Caso o login seja bem-sucedido
            setAuthenticated(true);
            setSessionId(responseData.headers.get('sessionid'));
            console.log("RESPONSE:", responseData);

        } catch (error) {
            // Verifica se há uma resposta e captura a mensagem de erro
            if (error.response && error.response.data) {
                const errorMessage = Array.isArray(error.response.data) ? error.response.data[0] : 'Invalid credentials';
                setErrorMessage(errorMessage);
            } else {
                setErrorMessage('Something went wrong. Please try again.');
            }
            console.error('Error logging in:', error);
        }
    };

    return (
        <main className="form-signin w-100 m-auto">
            <form onSubmit={handleSubmit}>
                <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
                <div className="form-floating">
                    <input
                        id="floatingInput"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        type="text"
                        className="form-control"
                    />
                    <label htmlFor="floatingInput">Nome do Usuário</label>
                </div>
                <div className="form-floating">
                    <input
                        id="floatingPassword"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        className="form-control"
                    />
                    <label htmlFor="floatingPassword">Password</label>
                </div>
                {errorMessage && (
                    <div id="alert" className="alert alert-warning">
                        <p className="close" data-dismiss="alert"></p>
                        {errorMessage}
                    </div>
                )}
                <button className="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
            </form>
        </main>
    );
};

export default Login;