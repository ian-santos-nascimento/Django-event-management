// App.js

import React, {useEffect, useState} from 'react';
import Login from './Login';
import NavBar from "./NavBar";
import LocaisList from "./ApiCall/locaisList.tsx";

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('authenticated');
        if (auth === 'true') {
            setAuthenticated(true);
        }
    }, []);

    const handleLogin = (authStatus) => {
        setAuthenticated(authStatus);
        localStorage.setItem('authenticated', authStatus);
    };
    console.log("AUTENTICADA", authenticated)
    return (
        <div>
            <NavBar setAuthenticated={handleLogin} isAuthenticated={authenticated} />
            <LocaisList/>
            {/* Your authenticated components go here */}
        </div>
    );
};

export default App;
