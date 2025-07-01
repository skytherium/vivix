const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Путь к базе данных
const dbPath = path.join(__dirname, 'SQLite', 'database.db');

const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8); // Генерация реферального кода
};

// Функция для получения статуса пользователя в зависимости от количества рефералов
const getStatus = (referralsCount) => {
    if (referralsCount >= 12) return 4;  // Статус 4 — 12 и более рефералов
    if (referralsCount >= 8) return 3;   // Статус 3 — от 8 рефералов
    if (referralsCount >= 4) return 2;   // Статус 2 — от 4 рефералов
    return 1;  // Статус 1 — менее 4 рефералов
};

// Проверка существования базы данных и создание, если она не существует
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Создание или открытие базы данных
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка при открытии базы данных:', err.message);
    } else {
        console.log('База данных подключена');
    }
});

// Создание таблицы users, если она не существует
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);



    const addColumnIfNotExists = (columnName, columnType, defaultValue = null) => {
        db.all("PRAGMA table_info(users)", (err, columns) => {
            if (err) {
                console.error("Ошибка при получении информации о таблице:", err.message);
                return;
            }

            const exists = columns.some(col => col.name === columnName);
            if (!exists) {
                let query = `ALTER TABLE users ADD COLUMN ${columnName} ${columnType}`;
                if (defaultValue !== null) query += ` DEFAULT ${defaultValue}`;
                db.run(query, (err) => {
                    if (err) {
                        console.error(`Ошибка при добавлении столбца ${columnName}:`, err.message);
                    } else {
                        console.log(`Столбец ${columnName} добавлен`);
                    }
                });
            }
        });
    };

    addColumnIfNotExists("referral_code", "TEXT");
    addColumnIfNotExists("referred_by", "INTEGER");
    addColumnIfNotExists("balance", "REAL", 0.0);
    addColumnIfNotExists("plan", "TEXT", `'Free'`);
    addColumnIfNotExists("plan_expiry", "TEXT");
    addColumnIfNotExists("created_at", "TEXT", `'${new Date().toISOString()}'`);
});
// РЕГИСТРАЦИЯ
app.post('/register', (req, res) => {
    const { username, password, referrerCode } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Требуется имя пользователя и пароль' });
    }

    const referralCode = generateReferralCode();  // Генерация реферального кода для нового пользователя
    let referredBy = null;

    // Если предоставлен реферальный код
    if (referrerCode) {
        db.get('SELECT id FROM users WHERE referral_code = ?', [referrerCode], (err, row) => {
            if (err) return res.status(500).json({ error: 'Ошибка базы данных' });

            if (row) {
                referredBy = row.id;
            }

            // Получаем количество рефералов у реферера
            db.get('SELECT COUNT(*) as count FROM users WHERE referred_by = ?', [referredBy], (err, countRow) => {
                if (err) return res.status(500).json({ error: 'Ошибка при получении количества рефералов' });

                // Получаем статус на основе количества рефералов
                const status = getStatus(countRow.count);

                db.run(
                    'INSERT INTO users (username, password, referral_code, referred_by, balance, plan, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [username, password, referralCode, referredBy, 0.0, 'Free', status],
                    (err) => {
                        if (err) return res.status(500).json({ error: 'Ошибка при регистрации' });
                        res.status(200).json({ message: 'Пользователь зарегистрирован' });
                    }
                );
            });
        });
    } else {
        db.run(
            'INSERT INTO users (username, password, referral_code, balance, plan, status) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, referralCode, 0.0, 'Free', 1],  // Статус по умолчанию — 1
            (err) => {
                if (err) return res.status(500).json({ error: 'Ошибка при регистрации' });
                res.status(200).json({ message: 'Пользователь зарегистрирован' });
            }
        );
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.get('/referral/:username', (req, res) => {
    const { username } = req.params;

    db.get('SELECT referral_code FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return res.status(500).json({ error: 'Ошибка при получении данных' });
        if (!row) return res.status(404).json({ error: 'Пользователь не найден' });

        const code = row.referral_code; // Получаем реферальный код
        const link = `http://localhost:3000/register?ref=${code}`; // или ваш домен

        res.json({ referralCode: code, referralLink: link });
    });
});


// ВХОД / LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Ошибка базы данных:', err.message);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }

        if (!row) {
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }

        res.json({ message: 'Успешный вход', user: row });
    });
});
app.get('/referral/count/:username', (req, res) => {
    const { username } = req.params;

    // Получаем ID пользователя по имени
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'Пользователь не найден' });

        const userId = row.id;

        // Считаем, сколько пользователей были приглашены этим ID
        db.get('SELECT COUNT(*) as count FROM users WHERE referred_by = ?', [userId], (err, row) => {
            if (err) return res.status(500).json({ error: 'Ошибка базы данных' });

            res.json({ count: row.count });
        });
    });
});
app.get('/referral/list/:username', (req, res) => {
    const { username } = req.params;

    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'Пользователь не найден' });

        const userId = row.id;

        // Достаём username + количество подрефералов
        const query = `
    SELECT u.username, 
           (SELECT COUNT(*) FROM users WHERE referred_by = u.id) AS referralCount,
           CASE WHEN u.plan = 'Active' THEN 1 ELSE 0 END AS isActive
    FROM users u
    WHERE u.referred_by = ?
`;

        db.all(query, [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Ошибка при получении списка рефералов' });

            res.json(rows);
        });
    });
});
app.get('/user/:username/info', (req, res) => {
    const { username } = req.params;

    db.get(`SELECT balance, plan, plan_expiry,status FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!row) return res.status(404).json({ error: 'Пользователь не найден' });

        const now = new Date();
        const expiry = row.plan_expiry ? new Date(row.plan_expiry) : null;

        // Проверка: если срок истёк — сбрасываем тариф
        if (expiry && expiry < now) {
            db.run(`UPDATE users SET plan = ?, plan_expiry = ? WHERE username = ?`, ['Free', null, username], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: 'Ошибка при сбросе тарифа' });
                return res.json({
                    balance: row.balance,
                    plan: 'Free',
                    plan_expiry: null,
                    status: row.status
                });
            });
        } else {
            res.json(row); // если всё ок — отправляем как есть
        }
    });
});



// АКТИВАЦИЯ ТАРИФА
app.post('/user/:username/activate', async (req, res) => {
    const { username } = req.params;
    const { months, cost } = req.body;

    if (!username || !months || !cost) {
        return res.status(400).json({ error: 'Недостаточно данных' });
    }

    const now = new Date();
    const expiryDate = new Date(now.setMonth(now.getMonth() + parseInt(months)));
    const expiryString = expiryDate.toISOString();

    db.get(`SELECT id, referred_by, plan, balance FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) {
            console.error('Ошибка при получении данных пользователя:', err.message);
            return res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const userId = row.id;
        const plan = row.plan;
        const balance = row.balance;
        const referredBy = row.referred_by;

        if (plan === 'Active') {
            return res.status(400).json({ error: 'У вас уже есть активная подписка' });
        }

        if (balance < cost) {
            return res.status(400).json({ error: 'Недостаточно средств на счете для активации тарифа' });
        }

        // Снимаем стоимость с баланса пользователя и активируем тариф
        db.run(`UPDATE users SET balance = balance - ?, plan = ?, plan_expiry = ? WHERE id = ?`,
            [cost, 'Active', expiryString, userId], (err) => {
                if (err) {
                    console.error('Ошибка при активации тарифа:', err.message);
                    return res.status(500).json({ error: 'Ошибка при активации тарифа' });
                }

                // Обработка многоуровневых начислений
                const distributeEarnings = (referralId, level, fromUserId) => {
                    const percentages = [20, 12, 9, 7, 5, 4, 3, 2, 1.5, 1.5, 1, 0.8, 0.6, 0.4, 0.2, 0.1];

                    if (!referralId || level >= percentages.length) return;

                    db.get(`SELECT id, referred_by, status FROM users WHERE id = ?`, [referralId], (err, refRow) => {
                        if (err || !refRow) return;

                        const allowedLevels = refRow.status * 4;
                        const earning = (cost * percentages[level]) / 100;

                        if (level < allowedLevels) {
                            db.run(`UPDATE users SET balance = balance + ? WHERE id = ?`, [earning, referralId], (err) => {
                                if (err) console.error(`Ошибка начисления уровня ${level + 1}:`, err.message);
                            });
                        } else {
                            console.log(`Пользователь ${referralId} пропущен на уровне ${level + 1}, статус ${refRow.status}`);
                        }

                        distributeEarnings(refRow.referred_by, level + 1, fromUserId);
                    });
                };

                distributeEarnings(referredBy, 0);
                res.json({
                    message: 'Тариф успешно активирован',
                    plan: 'Active',
                    balance: balance - cost
                });
            });
    });
});


app.post('/user/:username/deactivate', (req, res) => {
    const { username } = req.params;

    db.run(
        `UPDATE users 
         SET plan = ?, plan_expiry = ? 
         WHERE username = ?`,
        ['Free', null, username], // <== null передаётся как значение
        function (err) {
            if (err) {
                console.error('Ошибка при деактивации тарифа:', err.message);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            db.get(`SELECT balance, plan, plan_expiry FROM users WHERE username = ?`, [username], (err, row) => {
                if (err) return res.status(500).json({ error: 'Ошибка при получении данных' });
                res.json({ message: 'Тариф сброшен', ...row });
            });
        }
    );
});


// Изменение пароля
app.post('/user/:username/change-password', (req, res) => {
    const { username } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'Новый пароль обязателен' });
    }

    db.run(
        'UPDATE users SET password = ? WHERE username = ?',
        [newPassword, username],
        function (err) {
            if (err) {
                console.error('Ошибка при изменении пароля:', err.message);
                return res.status(500).json({ error: 'Ошибка при изменении пароля' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            res.json({ message: 'Пароль успешно изменён' });
        }
    );
});

// Изменение Instagram
app.post('/user/:username/change-instagram', (req, res) => {
    const { username } = req.params;
    const { newInstagram } = req.body;

    if (!newInstagram) {
        return res.status(400).json({ error: 'Новый Instagram обязателен' });
    }

    db.run(
        'UPDATE users SET instagram = ? WHERE username = ?',
        [newInstagram, username],
        function (err) {
            if (err) {
                console.error('Ошибка при изменении Instagram:', err.message);
                return res.status(500).json({ error: 'Ошибка при изменении Instagram' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            res.json({ message: 'Instagram успешно изменён' });
        }
    );
});

app.get('/top-referrals-week', (req, res) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const query = `
        SELECT u.username, COUNT(r.id) AS referralCount
        FROM users u
        LEFT JOIN users r ON r.referred_by = u.id AND r.id IN (
            SELECT id FROM users WHERE datetime(created_at) >= datetime(?)
        )
        GROUP BY u.username
        ORDER BY referralCount DESC
        LIMIT 10;
    `;

    db.all(query, [oneWeekAgo], (err, rows) => {
        if (err) {
            console.error('Ошибка при получении топа:', err.message);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }

        res.json(rows);
    });
});

app.get('/user/:username/required-instagram', (req, res) => {
    const { username } = req.params;

    const getChain = async (name, depth) => {
        const result = [];

        const getUser = (username) => {
            return new Promise((resolve, reject) => {
                db.get(`SELECT id, username, referred_by, instagram FROM users WHERE username = ?`, [username], (err, row) => {
                    if (err || !row) return resolve(null);
                    resolve(row);
                });
            });
        };

        let current = await getUser(name);
        let level = 0;

        while (current && current.referred_by && level < 3) {
            const parent = await new Promise((resolve) => {
                db.get(`SELECT id, username, referred_by, instagram FROM users WHERE id = ?`, [current.referred_by], (err, row) => {
                    if (err || !row) return resolve(null);
                    resolve(row);
                });
            });

            if (parent && parent.instagram) {
                result.push({ username: parent.username, instagram: parent.instagram });
            }

            current = parent;
            level++;
        }

        return result;
    };

    getChain(username, 3).then(data => res.json(data));
});


