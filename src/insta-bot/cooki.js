const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });

    await page.type("input[name='username']", 'virality_check', { delay: 50 });
    await page.type("input[name='password']", 'virality777', { delay: 50 });
    await page.click("button[type='submit']");

    console.log('🛑 Подтверди вход в Instagram вручную, если будет запрошено (например, код подтверждения).');

    // ⏳ Ждём 60 секунд
    await new Promise(resolve => setTimeout(resolve, 60000));

    const cookies = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));

    console.log('✅ Cookies сохранены в cookies.json');
    await browser.close();
})();
