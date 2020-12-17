import express from 'express';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
// this is all it takes to enable async/await for express middleware
import 'express-async-errors';
import logger from './utils/config-winston';
// all the routes for my app are retrieved from the src/routes/index.js module
import { getAuthAPIRouter, getViewRecipesRouter } from './routes';
import {
    rateLimiter,
    speedLimiter,
    speedLimiterView,
} from './utils/options-value';
import { corsRequest } from './utils/cors-options';
import { mode } from '../config';
import { stopAllWorkerPool } from './workers/index-service';
import { checkStatusLoginUserMiddleware } from './middlewares/auth-middleware';

// here's our generic error handler for situations where we didn't handle
// errors properly
function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}

function pageNotFoundMiddleware(_req, res) {
    res.status(404).render('404');
}

function errorMiddleware(error, _req, res) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    if (res.headersSent) {
        // next(error);
        res.json({ message: error.message });
    } else {
        logger.error(error);
        res.status(statusCode);
        res.json({
            message: error.message,
            // we only add a `stack` property in non-production environments
            ...(mode === 'production' ? null : { stack: error.stack }),
        });
    }
}

// ensures we close the server in the event of an error.
function setupCloseOnExit(server) {
    // thank you stack overflow
    // https://stackoverflow.com/a/14032965/971592
    async function exitHandler(options = {}) {
        await server
            .close()
            .then(() => {
                logger.info('Server successfully closed');
            })
            .catch((e) => {
                logger.warn('Something went wrong closing the server', e.stack);
            });

        if (options.exit) {
            if (options.exit) {
                stopAllWorkerPool();
                // eslint-disable-next-line no-process-exit
                process.exit();
                // throw new Error('Exit process.exit Node JS');
            }
        }
    }

    // do something when app is closing
    process.on('exit', exitHandler);
    // catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, { exit: true }));
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
    process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}

function startServer({ port = process.env.PORT } = {}) {
    const jsonBodyParser = bodyParser.json();
    const app = express();
    // Enable if your Express JS behind Reverse Proxy
    app.set('trust proxy', 1);
    // Debugging purpose with morgan
    app.use(morgan('combined', { stream: logger.stream }));
    // Middleware for http body
    app.use(express.urlencoded({ extended: true }));
    // Add cookie parser
    app.use(cookieParser());
    // Set view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.resolve(__dirname, 'views'));
    // Add static file assets
    app.use(express.static(path.resolve(__dirname, 'public')));

    // I mount my entire app to the /api route (or you could just do "/" if you want)
    // Use rate limiter and speed limiter for prevent brute force and spamming attacks
    // app.options('*', corsAllRequest);
    // Add helmet js for basic hardening security
    // Router untuk REST API backend
    app.use(
        '/api/v1',
        rateLimiter,
        speedLimiter,
        corsRequest,
        jsonBodyParser,
        helmet(),
        getAuthAPIRouter(),
    );

    // Router untuk tampilan View
    app.use(
        '/',
        rateLimiter,
        speedLimiterView,
        corsRequest,
        checkStatusLoginUserMiddleware,
        getViewRecipesRouter(),
    );

    // add the generic error handler just in case errors are missed by middleware
    app.use(notFound);
    app.use(pageNotFoundMiddleware);
    app.use(errorMiddleware);

    // I prefer dealing with promises. It makes testing easier, among other things.
    // So this block of code allows me to start the express app and resolve the
    // promise with the express server
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            logger.info(`Listening on port ${server.address().port}`);
            // this block of code turns `server.close` into a promise API
            const originalClose = server.close.bind(server);
            server.close = () =>
                new Promise((resolveClose) => {
                    originalClose(resolveClose);
                });
            // this ensures that we properly close the server when the program exists
            setupCloseOnExit(server);
            // resolve the whole promise with the express server
            resolve(server);
        });
    });
}

export default startServer;
