import { Worker } from 'worker_threads';
import path from 'path';
import os from 'os';
import logger from '../utils/config-winston';
import WorkerPool from './workerpool-threads';

import config from '../../config';

let workerPoolHashPassword = null;
let workerPoolComparePassword = null;
let workerPoolSignJwt = null;
let workerPoolVerifyJwt = null;
const workerPoolPrimes = null;
const cpuLength = os.cpus().length;

function runWorkerHashPassword(workerdata) {
    // Worker pool untuk menjalankan fungsi hash password
    if (workerPoolHashPassword === null) {
        const pathWorkerPoolHash = path.join(
            __dirname,
            'hashpasswords-worker.js',
        );
        if (config.mode === 'development') {
            workerPoolHashPassword = new WorkerPool(2, pathWorkerPoolHash);
        } else {
            workerPoolHashPassword = new WorkerPool(
                cpuLength,
                pathWorkerPoolHash,
            );
        }
    }

    // Menjalankan task secara banyak sekaligus,
    // atau bulk processing dengan Worker Pool Thread
    const arrayPromise = [];
    const promise = new Promise((resolve, reject) => {
        workerPoolHashPassword.runTask(workerdata, (errors, results) => {
            const stringDebug = `Error ${errors} Result ${JSON.stringify(
                results,
            )}`;
            logger.info(stringDebug);
            if (errors) {
                reject(errors);
            } else {
                resolve(results);
            }
        });
    });

    arrayPromise.push(promise);

    return Promise.allSettled(arrayPromise)
        .then((results) => {
            results.forEach((result) => logger.info(result.status));
            const result = results[0];
            if (result.status === 'fulfilled') {
                return Promise.resolve(result.value);
            }
            return Promise.reject(
                new Error('Gagal melakukan validasi kata sandi'),
            );
        })
        .catch((error) => {
            logger.error(error);
            return Promise.reject(error);
        });
}

function runWorkerComparePassword(workerdata) {
    // Worker pool untuk menjalankan fungsi hash password
    if (workerPoolComparePassword === null) {
        const pathWorkerPoolCompare = path.join(
            __dirname,
            'comparepassword-worker.js',
        );
        if (config.mode === 'development') {
            workerPoolComparePassword = new WorkerPool(
                2,
                pathWorkerPoolCompare,
            );
        } else {
            workerPoolComparePassword = new WorkerPool(
                cpuLength,
                pathWorkerPoolCompare,
            );
        }
    }

    // Menjalankan task secara banyak sekaligus,
    // atau bulk processing dengan Worker Pool Thread
    const arrayPromise = [];
    const promise = new Promise((resolve, reject) => {
        workerPoolComparePassword.runTask(workerdata, (errors, results) => {
            if (errors) {
                reject(errors);
            } else {
                resolve(results);
            }
        });
    });

    arrayPromise.push(promise);

    return Promise.allSettled(arrayPromise)
        .then((results) => {
            results.forEach((result) => logger.info(result.status));
            const result = results[0];
            if (result.status === 'fulfilled') {
                return Promise.resolve(result.value);
            }
            return Promise.reject(
                new Error('Gagal menemukan username dan password yang sesuai'),
            );
        })
        .catch((error) => {
            logger.error(error);
            return Promise.reject(error);
        });
}

function runWorkerSignJwt(workerdata) {
    // Worker pool untuk menjalankan fungsi hash password
    if (workerPoolSignJwt === null) {
        const pathWorkerPoolSign = path.join(__dirname, 'signjwt-worker.js');
        if (config.mode === 'development') {
            workerPoolSignJwt = new WorkerPool(2, pathWorkerPoolSign);
        } else {
            workerPoolSignJwt = new WorkerPool(cpuLength, pathWorkerPoolSign);
        }
    }

    // Menjalankan task secara banyak sekaligus,
    // atau bulk processing dengan Worker Pool Thread
    const arrayPromise = [];
    const promise = new Promise((resolve, reject) => {
        workerPoolSignJwt.runTask(workerdata, (errors, results) => {
            if (errors) {
                reject(errors);
            } else {
                resolve(results);
            }
        });
    });

    arrayPromise.push(promise);

    return Promise.allSettled(arrayPromise)
        .then((results) => {
            results.forEach((result) => logger.info(result.status));
            const result = results[0];
            if (result.status === 'fulfilled') {
                return Promise.resolve(result.value);
            }
            return Promise.reject(
                new Error(
                    'Gagal menandatangani username password untuk token pengguna',
                ),
            );
        })
        .catch((error) => {
            logger.error(error);
            return Promise.reject(error);
        });
}

function runWorkerVerifyJwt(workerdata) {
    // Worker pool untuk menjalankan fungsi hash password
    if (workerPoolVerifyJwt === null) {
        const pathWorkerPoolVerify = path.join(
            __dirname,
            'verifyjwt-worker.js',
        );
        if (config.mode === 'development') {
            workerPoolVerifyJwt = new WorkerPool(2, pathWorkerPoolVerify);
        } else {
            workerPoolVerifyJwt = new WorkerPool(
                cpuLength,
                pathWorkerPoolVerify,
            );
        }
    }

    // Menjalankan task secara banyak sekaligus,
    // atau bulk processing dengan Worker Pool Thread
    const arrayPromise = [];
    const promise = new Promise((resolve, reject) => {
        workerPoolVerifyJwt.runTask(workerdata, (errors, results) => {
            if (errors) {
                reject(errors);
            } else {
                resolve(results);
            }
        });
    });

    arrayPromise.push(promise);

    return Promise.allSettled(arrayPromise)
        .then((results) => {
            results.forEach((result) => logger.info(result.status));

            const result = results[0];
            if (result.status === 'fulfilled') {
                return Promise.resolve(result.value);
            }
            return Promise.reject(new Error('Data token tidak valid'));
        })
        .catch((error) => {
            logger.error(error);
            return Promise.reject(error);
        });
}

function stopAllWorkerPool() {
    // Hentikan semua worker pool
    if (workerPoolComparePassword !== null) {
        workerPoolComparePassword.close();
    }

    if (workerPoolSignJwt !== null) {
        workerPoolSignJwt.close();
    }

    if (workerPoolVerifyJwt !== null) {
        workerPoolVerifyJwt.close();
    }

    if (workerPoolHashPassword !== null) {
        workerPoolHashPassword.close();
    }

    logger.info('Close all worker pool threads');
}

export {
    runWorkerHashPassword,
    runWorkerComparePassword,
    runWorkerSignJwt,
    runWorkerVerifyJwt,
    stopAllWorkerPool,
};
