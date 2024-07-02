// Login.js

import React, { useState } from 'react';
import axios from 'axios';
import csrftoken from './ApiCall/CsrfToken'; // Import the CSRF token utility

const Login = ({ setAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username,
                password
            }, {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            setAuthenticated(true);
        } catch (error) {
            setErrorMessage('Invalid credentials');
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