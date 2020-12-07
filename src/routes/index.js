import express from 'express';
// any other routes imports would go here
import getAuthAPIRoutes from './authuser-api-router';
import getRecipeListRoutes from './recipes-view-router';

// REST API untuk Authentication
function getAuthAPIRouter() {
    const router = express.Router();
    router.use('/auth', getAuthAPIRoutes());
    return router;
}

// ROUTER VIEW untuk navigasi halaman
function getViewRecipesRouter() {
    const router = express.Router();
    router.use('/', getRecipeListRoutes());
    return router;
}

export { getAuthAPIRouter, getViewRecipesRouter };
