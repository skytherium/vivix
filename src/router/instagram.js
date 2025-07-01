// routes/instagram.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const CLIENT_ID = 'ТВОЙ_CLIENT_ID';
const CLIENT_SECRET = 'ТВОЙ_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/auth/instagram/callback';

router.get('/auth/instagram', (req, res) => {
    const url = `https://api.instagram.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    res.redirect(url);
});

router.get('/auth/instagram/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokenRes = await axios.post('https://api.instagram.com/oauth/access_token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code,
            },
        });

        const accessToken = tokenRes.data.access_token;

        const mediaRes = await axios.get('https://graph.instagram.com/me/media', {
            params: {
                fields: 'id,media_type,media_url',
                access_token: accessToken,
            },
        });

        const image = mediaRes.data.data.find(m => m.media_type === 'IMAGE');

        // можешь сохранить ссылку в базу или передать на фронт
        res.redirect(`/set-image?url=${encodeURIComponent(image.media_url)}`);
    } catch (err) {
        res.status(500).send('Ошибка авторизации Instagram');
    }
});

module.exports = router;
