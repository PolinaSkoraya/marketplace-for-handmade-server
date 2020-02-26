import jwt from 'jsonwebtoken'
import {TOKEN_SECRET} from './routers'

export function verify(req, res, next) {
    const token = req.header('auth-token');

    if (!token) {
        return res.status(401).send('Access denied!')
    };

    try {
        const verified = jwt.verify(token, TOKEN_SECRET);
        req.user = verified;
        next();

    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}