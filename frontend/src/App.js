// App.js

import React, {useEffect, useState} from 'react';
import { fab } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faEdit } from '@fortawesome/free-solid-svg-icons'
import Login from './components/Login';
import NavBar from "./components/NavBar";
library.add(fab, faSearch, faEdit)

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

    if (!authenticated) {
        return <Login setAuthenticated={setAuthenticated}/>
    }

    return (
        <div>
            <NavBar setAuthenticated={setAuthenticated} isAuthenticated={authenticated}/>
        </div>
    )

};

export default App;
