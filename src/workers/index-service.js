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
let workerPoolPrimes = null;
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
            const stringDebug = `${errors} ${results}`;
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
            return Promise.resolve(results);
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
            const stringDebug = `${errors} ${results}`;
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
            return Promise.resolve(results);
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
            const stringDebug = `${errors} ${results}`;
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
            return Promise.resolve(results);
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
        workerPoolSignJwt.runTask(workerdata, (errors, results) => {
            const stringDebug = `${errors} ${results}`;
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
            return Promise.resolve(results);
        })
        .catch((error) => {
            logger.error(error);
            return Promise.reject(error);
        });
}

function runWorkerPrimeService(workerData) {
    return new Promise((resolve, reject) => {
        const pathWorker = path.join(__dirname, 'calc-primes.worker.js');
        const worker = new Worker(pathWorker, { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

function runBubbleSortService(workerData) {
    return new Promise((resolve, reject) => {
        const pathWorker = path.join(__dirname, 'buble-sorts.worker.js');
        const worker = new Worker(pathWorker, {
            workerData,
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

function runWorkerPoolPrimeNumber(workerData) {
    // Jalankan task sebanyak 10 buah task
    const pathWorkerPrimepool = path.join(
        __dirname,
        'workerpool-primes.worker.js',
    );

    if (workerPoolPrimes === null) {
        if (config.mode === 'development') {
            workerPoolPrimes = new WorkerPool(2, pathWorkerPrimepool);
        } else {
            workerPoolPrimes = new WorkerPool(
                os.cpus().length,
                pathWorkerPrimepool,
            );
        }
    }

    // Menjalankan task secara banyak sekaligus,
    // atau bulk processing dengan Worker Pool Thread
    const arrayPromise = [];
    for (let i = 0; i < 10; i += 1) {
        // eslint-disable-next-line no-loop-func
        const promise = new Promise((resolve, reject) => {
            workerPoolPrimes.runTask(workerData, (errors, results) => {
                const stringDebug = `${i} ${errors} ${results}`;
                logger.info(stringDebug);
                if (errors) {
                    reject(errors);
                } else {
                    resolve(results);
                }
            });
        });
        arrayPromise.push(promise);
    }

    return Promise.allSettled(arrayPromise)
        .then((results) => {
            // workerPoolPrimes.close();
            results.forEach((result) => logger.info(result.status));
            return Promise.resolve(results);
        })
        .catch((error) => {
            logger.error(error);
            return Promise.reject(error);
        });
}

export {
    runWorkerHashPassword,
    runWorkerComparePassword,
    runWorkerSignJwt,
    runWorkerVerifyJwt,
    runWorkerPrimeService,
    runBubbleSortService,
    runWorkerPoolPrimeNumber,
};
