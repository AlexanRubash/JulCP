const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки токена
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Добавляем информацию о пользователе в запрос
        next();
    });
};

/**
 * Middleware для проверки роли пользователя
 * @param {string} role - Роль, требуемая для доступа
 */
const authorizeRole = (role) => (req, res, next) => {
    if (req.user?.role !== role) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
};

/**
 * Middleware для проверки наличия одной из ролей
 * @param {Array<string>} roles - Роли, разрешенные для доступа
 */
const authorizeRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
};

module.exports = { authenticateToken, authorizeRole, authorizeRoles };
