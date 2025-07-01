// initDB.js
const db = require('./db');

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  referral_code TEXT,
  referred_by TEXT
)`,
    (err) => {
        if (err) {
            console.error("Ошибка создания таблицы:", err.message);
        } else {
            console.log("✅ Таблица users готова");
        }
        db.close();
    });
