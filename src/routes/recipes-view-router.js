import express from 'express';

function homeViewController(_req, res) {
    res.render('home');
}

function listRecipeController(_req, res) {
    res.render('recipes-list');
}

function getRecipeListRoutes() {
    const router = express.Router();
    router.get('/', homeViewController);
    router.get('/recipes', listRecipeController);
    return router;
}

export default getRecipeListRoutes;
