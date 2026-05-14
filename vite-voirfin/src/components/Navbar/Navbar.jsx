import React, { useState } from 'react';
import { Spin as Hamburger } from 'hamburger-react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../Firebase/FirebaseService";
import logo from "../../assets/logo.png";
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("Sesión cerrada");
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <div className="layout-container">
            <nav className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="hamburger-btn">
                    <Hamburger toggled={isOpen} toggle={setOpen} size={25} />
                </div>
                
                <img src={logo} alt="logo" className="sidebar-logo" />
                
                <ul className="nav-links">
                    <li><Link to="/dashboard">🗃️ Menú Principal</Link></li>
                    <li><Link to="/reports">📈 Reportes Mensuales</Link></li>
                    <li><Link to="/budgetmanage">📋 Gestion de Presupuesto</Link></li>
                </ul>
                
                <button onClick={handleLogout} className="logout-button">
                    ➜] Cerrar Sesión
                </button>
            </nav>

            <main className={`content-area ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Navbar;