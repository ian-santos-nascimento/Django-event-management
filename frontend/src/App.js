// App.js

import React, {useEffect, useState} from 'react';
import Login from './Login';
import NavBar from "./NavBar";
import LocaisList from "./ApiCall/locaisList.tsx";

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        const auth = localStorage.getItem('sessionId');
        setSessionId(auth)
        if (!isNaN(auth)) {
            console.log("AUTENTICADA")
            setAuthenticated(true);
        }
    }, []);
    console.log("AUTENTICADA", authenticated)

    if (!authenticated) {
        console.log("ENTRANDO NO LOGIN", authenticated)
        return <Login setAuthenticated={setAuthenticated}/>
    }

    return (
        <div>
            <NavBar setAuthenticated={setAuthenticated} isAuthenticated={authenticated}/>
            <LocaisList sessionId={sessionId}/>
            {/* Your authenticated components go here */}
        </div>
    );
};

export default App;
