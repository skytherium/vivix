import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        const success = await login(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setErrorMessage('Неверный логин или пароль');
        }
    };

    return (
        <div>
            <h2>Вход</h2>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин"
            />
            <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                type="password"
            />
            <button onClick={handleLogin}>Войти</button>
        </div>
    );
};

export default Login;
