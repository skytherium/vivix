import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [instagram, setInstagram] = useState('');

    const location = useLocation();

    // Автоматически вытягиваем ?ref=ID из URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const refFromUrl = searchParams.get('ref');
        if (refFromUrl) {
            setReferralCode(refFromUrl);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password,instagram, referrerCode: referralCode }), // передаём код
        });

        const data = await response.json();
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
            />
            <input
                type="text"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value)}
                placeholder="Реферальный код (если есть)"
            />
            <input
                type="text"
                placeholder="Instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
            />
            <button type="submit">Register</button>
        </form>
    );
};


export default Register;
