import './NavBar.css'
import axios from "axios";
import csrftoken from "./ApiCall/CsrfToken";

export default function NavBar({setAuthenticated}) {
    const logout = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/logout/', {}, {
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            setAuthenticated = false;
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    return (
        <div className="container">
            <header className="d-flex flex-wrap justify-content-center py-2 mb-4 border-bottom">
                <a href="/"
                   className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
                    <img src="../public/bg-logo.png" alt=""/>
                    <span className="fs-4">Boutique Gourmet</span>
                </a>

                <ul className="nav nav-pills">
                    <li className="nav-item"><a href="/" className="nav-link"
                                                aria-current="page">Home</a></li>
                    <li className="nav-item"><a href="/" className="nav-link">Eventos</a></li>
                    <li className="nav-item"><a href="/" className="nav-link">Cardápio</a></li>
                    <li className="nav-item"><a href="/" className="nav-link">Terceiros</a></li>
                    <li className="nav-item"><a href="/" className="nav-link">Usuarios</a></li>
                    <li className="nav-item">
                        <button onClick={logout} className="nav-link">Log Out</button>
                    </li>
                </ul>
            </header>
        </div>
    )
}