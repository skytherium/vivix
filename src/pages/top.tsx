import React, { useEffect, useState } from 'react';

type TopUser = {
    username: string;
    referralCount: number;
};

const Top = () => {
    const [topUsers, setTopUsers] = useState<TopUser[]>([]); // ⬅️ вот тут задаём тип

    useEffect(() => {
        fetch('http://localhost:4000/top-referrals-week')
            .then(res => res.json())
            .then(data => setTopUsers(data))
            .catch(err => console.error('Ошибка загрузки топа:', err));
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>🏆 Топ 10 участников недели</h2>
            {topUsers.length === 0 ? (
                <p>Данные загружаются или участников пока нет.</p>
            ) : (
                <ol>
                    {topUsers.map((user, index) => (
                        <li key={index} style={{ marginBottom: '10px' }}>
                            <strong>{user.username}</strong> — {user.referralCount} рефералов
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default Top;
