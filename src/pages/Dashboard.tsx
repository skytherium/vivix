import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import Sidebar from '../components/Sidebar';
import ReferralBlock from '../components/ReferralBlock';

const Dashboard = () => {

    type FollowTarget = {
        username: string;
        instagram: string;
    };

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [expirationDate, setExpirationDate] = useState<string | null>(null);

    const [requiredFollows, setRequiredFollows] = useState<FollowTarget[]>([]);


    type TabType = 'referrals' | 'plan' | 'task' | 'settings' | 'education' | 'cash';
    const [activeTab, setActiveTab] = useState<TabType>('referrals');

    const [referral, setReferral] = useState<{ referralCode: string; referralLink: string } | null>(null);
    const [refCount, setRefCount] = useState<number | null>(null);
    const [referrals, setReferrals] = useState<{ username: string, referralCount: number, isActive: boolean }[]>([]);

    const [plan, setPlan] = useState<string | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Для формы изменения пароля и Instagram
    const [newPassword, setNewPassword] = useState<string>('');
    const [newInstagram, setNewInstagram] = useState<string>('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetch(`http://localhost:4000/referral/${user.username}`)
                .then(res => res.json())
                .then(data => setReferral(data));

            fetch(`http://localhost:4000/referral/count/${user.username}`)
                .then(res => res.json())
                .then(data => setRefCount(data.count));

            fetch(`http://localhost:4000/referral/list/${user.username}`)
                .then(res => res.json())
                .then(data => {
                    setReferrals(data);  // data должно содержать поле isActive
                });

            fetch(`http://localhost:4000/user/${user.username}/info`)
                .then(res => res.json())
                .then(data => {
                    console.log('🟢 DATA FROM BACKEND:', data); // <-- вот сюда

                    setPlan(data.plan);
                    setBalance(data.balance);
                    setUserStatus(data.status);      // Новый
                    setExpirationDate(data.plan_expiry); // Добавляем обработку даты
                });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:4000/user/${user.username}/required-instagram`)
                .then(res => res.json())
                .then(data => setRequiredFollows(data));
        }
    }, [user]);

    const handleCheckFollow = (referrer: string) => {
        if (!user) return;

        fetch(`http://localhost:4001/check-subscription?referrer=${referrer}&user=${user.username}`)
            .then(res => res.json())
            .then(data => {
                if (data.result) {
                    alert("✅ Подписка подтверждена!");
                } else {
                    alert("❌ Вы не подписались.");
                }
            });
    };


    const handleUpgradePlan = (months: number, cost: number) => {
        if (!user || balance === null) return;

        if (balance >= cost) {
            setIsProcessing(true);

            fetch(`http://localhost:4000/user/${user.username}/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ months, cost }),
            })
                .then(async res => {
                    const data = await res.json();

                    if (!res.ok) {
                        alert(data.error || 'Ошибка при активации');
                        setIsProcessing(false);
                        return;
                    }

                    setPlan(data.plan);
                    setBalance(data.balance);
                    setIsProcessing(false);
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    alert('Ошибка при активации тарифа');
                    setIsProcessing(false);
                });
        } else {
            alert('Недостаточно средств на балансе!');
        }
    };

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:4000/user/${user.username}/required-instagram`)
                .then(res => res.json())
                .then(data => setRequiredFollows(data));
        }
    }, [user]);

    const handleChangePassword = () => {
        if (!user || !newPassword) return;

        fetch(`http://localhost:4000/user/${user.username}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword }),
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message || 'Пароль успешно изменен');
                setNewPassword('');
            })
            .catch(error => {
                console.error('Ошибка при изменении пароля:', error);
                alert('Ошибка при изменении пароля');
            });
    };

    const handleChangeInstagram = () => {
        if (!user || !newInstagram) return;

        fetch(`http://localhost:4000/user/${user.username}/change-instagram`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({newInstagram}),
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message || 'Instagram успешно обновлен');
                setNewInstagram('');
            })
            .catch(error => {
                console.error('Ошибка при изменении Instagram:', error);
                alert('Ошибка при изменении Instagram');
            });

    }

    const renderContent = () => {
        switch (activeTab) {
            case 'referrals':
                return (
                    <>
                        {referral && (
                            <div className="referral-info">
                                <h3>Реферальная информация</h3>
                                <p>Ваш код: <strong>{referral.referralCode}</strong></p>
                                <p>Ссылка: <a href={referral.referralLink}>{referral.referralLink}</a></p>
                            </div>
                        )}

                        {refCount !== null && (
                            <div className="referral-count">
                                <h3>Приглашено пользователей: <strong>{refCount}</strong></h3>
                            </div>
                        )}

                        {referrals.length > 0 && (
                            <div className="referral-list">
                                <h3>Ваши рефералы</h3>
                                <div className="referral-cards">
                                    {referrals.map((ref, index) => (
                                        <div className="referral-card">
                                            <div className="referral-avatar-wrapper">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/personas/svg?seed=${ref.username}`}
                                                    alt="avatar"
                                                    className="referral-avatar"
                                                />
                                            </div>
                                            <p className="referral-name">{ref.username}</p>
                                            <p className="referral-level">LVL 123</p>
                                            <p className="referral-country">123</p>
                                            <p className={`referral-status ${ref.isActive ? 'active' : 'inactive'}`}>
                                                {ref.isActive ? 'Активен' : 'Не активен'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                );

            case 'plan':
                return (
                    <div className="plan-container">
                        {plan && balance !== null ? (
                            <>
                                <h3>Ваш тариф: <strong>{plan}</strong></h3>
                                <p>Баланс: <strong>${balance.toFixed(2)}</strong></p>
                            </>
                        ) : (
                            <p>Загрузка данных о тарифе и балансе...</p>
                        )}

                        <h4>Выберите тариф</h4>
                        <ul className="plan-options">
                            <li>
                                <strong>1 месяц</strong> — $10
                                <button onClick={() => handleUpgradePlan(1, 10)} disabled={isProcessing}>
                                    {isProcessing ? 'Обработка...' : 'Купить'}
                                </button>
                            </li>
                            <li>
                                <strong>6 месяцев</strong> — $50
                                <button onClick={() => handleUpgradePlan(6, 50)} disabled={isProcessing}>
                                    {isProcessing ? 'Обработка...' : 'Купить'}
                                </button>
                            </li>
                            <li>
                                <strong>12 месяцев</strong> — $80
                                <button onClick={() => handleUpgradePlan(12, 80)} disabled={isProcessing}>
                                    {isProcessing ? 'Обработка...' : 'Купить'}
                                </button>
                            </li>
                        </ul>
                    </div>
                );
            case 'task':
                return (
                    <div className="task-container">
                        <h3>Задание: Подписка на вышестоящих</h3>
                        {requiredFollows.length === 0 ? (
                            <p>У вас пока нет вышестоящих, на кого нужно подписаться.</p>
                        ) : (
                            requiredFollows.map((ref, idx) => (
                                <div key={idx} className="follow-task">
                                    <a href={`https://instagram.com/${ref.instagram}`} target="_blank" rel="noreferrer">
                                        @{ref.instagram}
                                    </a>
                                    <button onClick={() => handleCheckFollow(ref.username)}>
                                        Проверить подписку
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'settings':
                return (
                    <div className="settings-container">
                        <h3>Настройки аккаунта</h3>

                        <div className="settings-block">
                            <label>Новый пароль:</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <button onClick={handleChangePassword}>Изменить пароль</button>
                        </div>

                        <div className="settings-block">
                            <label>Новый Instagram:</label>
                            <input type="text" value={newInstagram} onChange={(e) => setNewInstagram(e.target.value)} />
                            <button onClick={handleChangeInstagram}>Изменить Instagram</button>
                        </div>
                    </div>
                );
            case 'education':
                return (
                    <div className="education-container">
                        <h3>Обучение</h3>
                        <p>Здесь вы сможете проходить обучение. Доступ к урокам зависит от вашего статуса.</p>

                        {Number(userStatus) >= 1 && (
                            <div className="lesson-block">
                                <h4>Урок 1: Базовая настройка</h4>
                                <iframe src="https://www.youtube.com/embed/ВСТАВЬ_СЮДА_ID_ВИДЕО_1" title="Урок 1" allowFullScreen></iframe>
                            </div>
                        )}

                        {Number(userStatus) >= 2 && (
                            <div className="lesson-block">
                                <h4>Урок 2: Реферальная система</h4>
                                <iframe src="https://www.youtube.com/embed/ВСТАВЬ_СЮДА_ID_ВИДЕО_2" title="Урок 2" allowFullScreen></iframe>
                            </div>
                        )}

                        {Number(userStatus) >= 3 && (
                            <div className="lesson-block">
                                <h4>Урок 3: Продвижение</h4>
                                <iframe src="https://www.youtube.com/embed/ВСТАВЬ_СЮДА_ID_ВИДЕО_3" title="Урок 3" allowFullScreen></iframe>
                            </div>
                        )}

                        {Number(userStatus) >= 4 && (
                            <div className="lesson-block">
                                <h4>Урок 4: Лидерство и масштабирование</h4>
                                <iframe src="https://www.youtube.com/embed/ВСТАВЬ_СЮДА_ID_ВИДЕО_4" title="Урок 4" allowFullScreen></iframe>
                            </div>
                        )}
                    </div>

                );
            default:
                return null;
        }
    };

    return (
        <div className="layout">
            <Sidebar
                user={user}
                balance={balance}
                refCount={refCount}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />


            <main className="main-content">
                <div className="dashboard-header">
                    {userStatus && referral && (
                        <ReferralBlock
                            code={referral.referralCode}
                            link={referral.referralLink}
                            inviter={{ name: 'Name_666', rank: 4, avatar: '/avatars/mentor.jpg' }}
                            level={Number(userStatus)}
                            nextLevelCount={4 * Number(userStatus)}
                            progressCount={Number(refCount || 0)}
                        />

                    )}
                </div>

                <div className="dashboard-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );

};

export default Dashboard;
