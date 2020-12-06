import express from 'express';
import authLoginController from '../controllers/auth-login-controller';
import authSignUpController from '../controllers/auth-signup-controller';
import authLogoutController from '../controllers/auth-logout-controller';

function getAuthAPIRoutes() {
    const router = express.Router();
    router.post('/login', authLoginController);
    router.post('/signup', authSignUpController);
    router.get('/logout', authLogoutController);
    return router;
}

export default getAuthAPIRoutes;
