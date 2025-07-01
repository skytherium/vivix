// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './layout/App';
import Header from "./layout/header";
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom'; // Обязательно импортируй Router

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <AuthProvider>
            <Router> {/* Оборачиваем весь контент в Router */}
                <Header />
                <App />
            </Router>
        </AuthProvider>
    </React.StrictMode>
);
