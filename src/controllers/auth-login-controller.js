import {
    runWorkerSignJwt,
    runWorkerComparePassword,
} from '../workers/index-service';
import logger from '../utils/config-winston';
import { secretjwt } from '../../config';
import { maxAgeToken, HASH_TYPE_BCRYPT } from '../utils/konstans-data';

import {
    validateEmailUser,
    validatePasswordUser,
} from '../services/login-validator';
import {
    handleErrorLogin,
    handleErrorLoginDatabase,
} from '../services/login-error-handler';
import { getDataUser } from '../repository/auth-repo';

let userItemDatabase = {};

async function getSignedJwtWorkers(res) {
    // Buat signet JWT dengan worker
    const workerdata = {
        usermodel: userItemDatabase,
        secretjwt,
    };

    try {
        const tokenData = await runWorkerSignJwt(workerdata);
        if (tokenData.accesstoken) {
            res.cookie('jwtToken', tokenData.accesstoken, {
                httpOnly: true,
                maxAge: maxAgeToken * 1000,
            });

            res.status(200).json({
                message: 'Sukses',
                // eslint-disable-next-line no-underscore-dangle
                userid: userItemDatabase._id,
                email: userItemDatabase.email,
                accessToken: tokenData.accessToken,
            });
        }
    } catch (err) {
        logger.error(`Error membuat akses token ${JSON.stringify(err)}`);
        const error = new Error('Error membuat akses token');
        error.status = 100;
        error.stack = err.stack;
        res.status(400).json({
            message: 'Kata sandi tidak cocok',
            error,
        });
    }
}

async function comparePasswordUserWorker(workerdata, res) {
    // Jalankan worker thread untuk komparasi password
    try {
        const resultCompareData = await runWorkerComparePassword(workerdata);
        logger.info(
            `Hasil komparasi password selesai ${JSON.stringify(
                resultCompareData,
            )}`,
        );

        const isPasswordOk = resultCompareData.result;
        if (isPasswordOk === true) {
            // Pengguna ada di database dan compare password berhasil
            // Lanjutkan proses buat JWT
            getSignedJwtWorkers(res);
        } else {
            // Password salah dan tidak benar
            const error = new Error('Kata sandi tidak sama');
            error.status = 100;
            const errorObject = handleErrorLoginDatabase(error);
            res.status(400).json({
                message: 'Kata sandi tidak cocok',
                error: errorObject,
            });
        }
    } catch (err) {
        logger.error(`Error compare password ${err.stack}`);
        const error = new Error('Kata sandi tidak sama');
        error.status = 100;
        error.stack = err;
        const errorObject = handleErrorLoginDatabase(error);
        res.status(400).json({
            message: 'Kata sandi tidak cocok',
            error: errorObject,
        });
    }
}

async function getUserDataFromDatabase(email, password, res) {
    // Ambil data pengguna dari database mongodb
    try {
        const resultUserData = await getDataUser(email);
        logger.warn(JSON.stringify(resultUserData));
        if (resultUserData) {
            userItemDatabase = resultUserData;
            // komparasi password dari database
            const workerdata = {
                typehash: HASH_TYPE_BCRYPT,
                plainpass: password,
                passhashdb: resultUserData.password,
            };
            comparePasswordUserWorker(workerdata, res);
        }
    } catch (err) {
        logger.error(`Error query login database ${err.stack}`);
        const errorObject = handleErrorLoginDatabase(err);
        res.status(400).json({
            message: 'Gagal mengambil data pengguna',
            error: errorObject,
        });
    }
}

async function authLoginController(req, res) {
    let errorObject = {};

    // Validasi email dan password
    try {
        const emailValidationResult = await validateEmailUser(req);
        const passwordValidationResult = await validatePasswordUser(req);

        if (
            emailValidationResult.errors.length > 0 &&
            passwordValidationResult.errors.length > 0
        ) {
            errorObject = handleErrorLogin({
                erremail: emailValidationResult.errors,
                errpasword: passwordValidationResult.errors,
            });

            // Kirim response balikan error
            res.status(400).json({
                message: 'Gagal mengolah permintaan',
                error: errorObject,
            });
        } else {
            // Lakukan proses komparasi data dari database dengan kiriman pengguna
            getUserDataFromDatabase(req.body.email, req.body.password, res);
        }
    } catch (err) {
        logger.error(`Error data ${JSON.stringify(err.stack)}`);
        res.status(400).json({
            status: false,
            message: 'Ditemukan kesalahan dalam mengelola request',
            errors: JSON.stringify(err.stack),
        });
    }
}

export default authLoginController;
