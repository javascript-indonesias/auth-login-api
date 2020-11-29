import express from 'express';
// any other routes imports would go here
import getMathRoutes from './math';
import getBlogRoutes from './blog-api';
import getCovidRoutes from './covid-route-sample';
import getMockRoutes from './mock-data';
import getValidasiTesRoutes from './validation-testing';

import getAuthAPIRoutes from './authuser-api-router';
import getRecipeListRoutes from './recipes-view-router';

function getRoutes() {
    // create a router for all the routes of our app
    const router = express.Router();
    router.use('/math', getMathRoutes());
    router.use('/blog', getBlogRoutes());
    // any additional routes would go here
    return router;
}

function getCovidRouter() {
    const router = express.Router();
    router.use('/data', getCovidRoutes());
    return router;
}

function getMockDataRouter() {
    const router = express.Router();
    router.use('/', getMockRoutes());
    return router;
}

function getValidationTesRouter() {
    const router = express.Router();
    router.use('/', getValidasiTesRoutes());
    return router;
}

function getAuthAPIRouter() {
    const router = express.Router();
    router.use('/auth', getAuthAPIRoutes());
    return router;
}

function getViewRecipesRouter() {
    const router = express.Router();
    router.use('/', getRecipeListRoutes());
    return router;
}

export {
    getRoutes,
    getCovidRouter,
    getMockDataRouter,
    getValidationTesRouter,
    getAuthAPIRouter,
    getViewRecipesRouter,
};
