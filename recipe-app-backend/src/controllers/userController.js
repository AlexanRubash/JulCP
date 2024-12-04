const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Генерация access и refresh токенов
const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
            [username, hashedPassword, role || 'user']
        );
        res.status(201).send('User registered');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const accessToken = generateAccessToken({ user_id: user.user_id, role: user.role });
            const refreshToken = generateRefreshToken({ user_id: user.user_id, role: user.role });

            // Сохранение refresh токена в базе данных (по желанию)
            await db.query('INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)', [refreshToken, user.user_id]);

            res.json({ accessToken, refreshToken });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Error logging in');
    }
};

const refreshAccessToken = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).send('Refresh token required');

    try {
        // Проверка существования токена в базе данных (по желанию)
        const result = await db.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
        if (result.rowCount === 0) return res.status(403).send('Invalid refresh token');

        jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) return res.status(403).send('Invalid refresh token');

            const accessToken = generateAccessToken({ user_id: user.user_id, role: user.role });
            res.json({ accessToken });
        });
    } catch (err) {
        res.status(500).send('Error refreshing token');
    }
};

module.exports = { registerUser, loginUser, refreshAccessToken };
