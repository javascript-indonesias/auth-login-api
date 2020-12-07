import express from 'express';
import { requireAuthTokenMiddleware } from '../middlewares/auth-middleware';
import authLogoutController from '../controllers/auth-logout-controller';

function homeViewController(_req, res) {
    res.render('home');
}

function listRecipeController(_req, res) {
    res.render('recipes-list');
}

const loginViewController = (_req, res) => {
    res.render('login');
};

const signupViewController = (_req, res) => {
    res.render('signup');
};

function getRecipeListRoutes() {
    const router = express.Router();
    router.get('/', homeViewController);
    router.get('/login', loginViewController);
    router.get('/signup', signupViewController);
    router.get('/logout', authLogoutController);
    router.get('/recipes', requireAuthTokenMiddleware, listRecipeController);
    return router;
}

export default getRecipeListRoutes;
