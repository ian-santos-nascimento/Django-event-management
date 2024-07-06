// App.js

import React, {useEffect, useState} from 'react';
import {fab} from '@fortawesome/free-brands-svg-icons'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faSearch, faEdit} from '@fortawesome/free-solid-svg-icons'
import Login from './components/Login';
import NavBar from "./components/NavBar";
import sessionId from "./ApiCall/SessionId";
library.add(fab, faSearch, faEdit)

const auth = sessionId


const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [sessionId, setSessionId] = useState(auth);

    useEffect(() => {
        console.log("AUTH", auth)
        if (auth !== null) {
            console.log("AUTENTICADA" + auth)
            setSessionId(auth)
            setAuthenticated(true);
        }
    }, []);

    if (!authenticated) {
        return <Login setAuthenticated={setAuthenticated} setSessionId={setSessionId}/>
    }

    return (
        <div>
            <NavBar setAuthenticated={setAuthenticated} isAuthenticated={authenticated}/>
        </div>
    )

};

export default App;
