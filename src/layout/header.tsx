import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
    const location = useLocation();

    const headerLinks = [
        { label: "Главная", to: "/" },
        { label: "Кабинет", to: "/login" },
        { label: "Поддержка", to: "/support" },
        { label: "Регистрация", to: "/register" },
    ];

    return (
        <div className="header-main">
            <div className="header-block">
                <div className="logo">
                    {/* логотип потом */}
                    VIVYX
                </div>

                <div className="menu-line">
                    {headerLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.to}
                            className={`header-button ${location.pathname === link.to ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <Link to="/login" className="login-button">Войти</Link>
            </div>
        </div>
    );
};

export default Header;
