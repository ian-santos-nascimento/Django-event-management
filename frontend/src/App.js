// App.js

import React, { useState } from 'react';
import Login from './Login';
import NavBar from "./NavBar"; // Import the CSRF token

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);


    if (!authenticated) {
        return <Login setAuthenticated={setAuthenticated} />;
    }

    return (
        <div>
            <NavBar isAuthenticated={authenticated}/>
            <h1>Pagina Home</h1>
            {/* Your authenticated components go here */}
        </div>
    );
};

export default App;
