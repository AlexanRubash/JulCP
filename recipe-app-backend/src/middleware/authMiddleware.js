const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.sendStatus(403);
    }
    next();
};

module.exports = { authenticateToken, authorizeRole };