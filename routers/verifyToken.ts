import jwt from 'jsonwebtoken'
const TOKEN_SECRET = 'sgsdrgsfsrs';

export function verify(req, res, next) {
    const token = req.header('auth-token');

    if (!token) {
        return res.status(401).send('Access denied!')
    }

    try {
        req.user = jwt.verify(token, TOKEN_SECRET);
        next();

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}