import express from 'express';
import authLoginController from '../controllers/auth-login-controller';
import authSignUpController from '../controllers/auth-signup-controller';

function getAuthAPIRoutes() {
    const router = express.Router();
    router.post('/login', authLoginController);
    router.post('/signup', authSignUpController);
    return router;
}

export default getAuthAPIRoutes;
