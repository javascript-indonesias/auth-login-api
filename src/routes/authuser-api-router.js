import express from 'express';
import authLoginController from '../controllers/auth-login-controller';

function getAuthAPIRoutes() {
    const router = express.Router();
    router.post('/login', authLoginController);
    return router;
}

export default getAuthAPIRoutes;
