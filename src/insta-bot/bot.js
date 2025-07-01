const express = require('express');
const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 4001;

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, '../SQLite/SQLite/database.db');
console.log('📂 Используем путь к базе:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('❌ Ошибка подключения к базе:', err.message);
    else console.log('✅ База данных подключена');
});

let isChecking = false;

function getInstagram(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT instagram FROM users WHERE username = ?', [username], (err, row) => {
            if (err) return reject('SQLite ошибка: ' + err.message);
            if (!row) return reject('❌ Пользователь не найден: ' + username);
            if (!row.instagram) return reject('⚠️ У пользователя нет Instagram: ' + username);
            resolve(row.instagram);
        });
    });
}

async function checkIfUserFollows(referrerInstagram, targetInstagram) {
    console.log('\n🟡 Начинаем проверку...');
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf-8'));
        await page.setCookie(...cookies);
        await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
        console.log('🔓 Авторизация через cookies прошла успешно');

        const url = `https://www.instagram.com/${referrerInstagram}/`;
        console.log(`➡️ Переход к профилю: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector('a[href$="/followers/"]', { timeout: 30000 });
        await page.click('a[href$="/followers/"]');

        console.log('⌛ Ждём появления элементов в модальном окне...');
        await page.waitForSelector('div[role="dialog"] a[href^="/"]', { timeout: 30000 });

        let found = false;
        let usernames = [];

        for (let i = 0; i < 50; i++) {
            usernames = await page.$$eval(
                'div[role="dialog"] a[href^="/"]',
                anchors => anchors.map(a => a.textContent?.trim().toLowerCase()).filter(Boolean)
            );

            console.log(`🔎 Попытка ${i + 1}: найдено ${usernames.length} имён`);

            if (usernames.includes(targetInstagram.trim().toLowerCase())) {
                found = true;
                break;
            }

            // Имитируем прокрутку колесом мыши
            await page.mouse.wheel({ deltaY: 400 });
            await new Promise(r => setTimeout(r, 600));
        }

        console.log("👀 Первые 20 имён:", usernames.slice(0, 20));
        console.log(`✅ Результат: ${found ? 'ПОДПИСАН' : 'НЕ ПОДПИСАН'}`);
        await browser.close();
        return found;

    } catch (err) {
        console.error('❌ Ошибка проверки:', err.message);
        await browser.close();
        return false;
    }
}

app.get('/check-subscription', async (req, res) => {
    const { referrer, user } = req.query;

    if (isChecking) return res.status(429).json({ error: '⏳ Проверка уже идёт. Подождите.' });
    if (!referrer || !user) return res.status(400).json({ error: '❗ Нужны параметры referrer и user' });

    try {
        isChecking = true;

        const refInstagram = await getInstagram(referrer);
        const userInstagram = await getInstagram(user);

        const result = await checkIfUserFollows(refInstagram, userInstagram);
        res.json({ result });

    } catch (err) {
        res.status(500).json({ error: String(err) });
    } finally {
        isChecking = false;
    }
});

app.listen(port, () => {
    console.log(`🚀 BOT API работает на http://localhost:${port}`);
});
