import {
    runWorkerSignJwt,
    runWorkerComparePassword,
} from '../workers/index-service';
import logger from '../utils/config-winston';
import { secretjwt } from '../../config';
import {
    maxAgeToken,
    HASH_TYPE_BCRYPT,
    HASH_TYPE_ARGON,
} from '../utils/konstans-data';

import {
    validateEmailUser,
    validatePasswordUser,
} from '../services/login-validator';
import {
    handleErrorValidationLogin,
    handleErrorLoginDatabase,
} from '../services/login-error-handler';
import { getDataUser } from '../repository/auth-repo';

let userItemDatabase = {};

function handleResponseError(res, errobject, errCode = 400) {
    // Jika terjadi error dalam pengolahan data, kirim dengan response ini
    const errorObjectData = errobject;
    errorObjectData.status = 'Gagal';
    res.status(errCode).json(errorObjectData);
}

async function createJWTLogin(res) {
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
                sameSite: 'lax',
            });

            res.status(200).json({
                message: 'Sukses',
                id: userItemDatabase.id,
                email: userItemDatabase.email,
                accesstoken: tokenData.accesstoken,
            });
        } else {
            handleResponseError(res, {
                message: 'Email dan kata sandi tidak cocok',
            });
        }
    } catch (err) {
        logger.error(`Error membuat akses token ${JSON.stringify(err)}`);
        const error = new Error('Error membuat akses token');
        error.status = 100;
        error.stack = err.stack;

        handleResponseError(res, {
            message: 'Email dan kata sandi tidak cocok',
            error,
        });
    }
}

async function comparePasswordUserWorker(workerdata, res) {
    // Jalankan worker thread untuk komparasi password
    try {
        const resultCompareData = await runWorkerComparePassword(workerdata);
        const isPasswordOk = resultCompareData.result;
        if (isPasswordOk === true) {
            // Pengguna ada di database dan compare password berhasil
            // Lanjutkan proses buat JWT
            createJWTLogin(res);
        } else {
            // Password salah dan tidak benar
            const error = new Error('Kata sandi tidak cocok dengan akun ini');
            error.status = 100;
            const errorObject = handleErrorLoginDatabase(error);

            handleResponseError(res, {
                message: 'Kata sandi tidak cocok dengan akun ini',
                error: errorObject,
            });
        }
    } catch (err) {
        logger.error(`Error compare password ${err.stack}`);
        const error = new Error('Kata sandi tidak cocok dengan akun ini');
        error.status = 100;
        error.stack = err;
        const errorObject = handleErrorLoginDatabase(error);

        handleResponseError(res, {
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
            // Konversi nilai id dari ObjectID ke bentuk String
            // const userID = resultUserData._id.toString();
            userItemDatabase = {
                email: resultUserData.email,
                password: resultUserData.password,
                id: resultUserData.userids,
            };

            // komparasi password dari database
            const workerdata = {
                typehash: HASH_TYPE_ARGON,
                plainpass: password,
                passhashdb: resultUserData.password,
            };
            comparePasswordUserWorker(workerdata, res);
        }
    } catch (err) {
        logger.error(`Error query login database ${err.stack}`);
        const errorObject = handleErrorLoginDatabase(err);

        handleResponseError(res, {
            message: 'Gagal mengambil data pengguna',
            error: errorObject,
        });
    }
}

async function authLoginController(req, res) {
    // Validasi email dan password
    try {
        const emailValidationResult = await validateEmailUser(req);
        const passwordValidationResult = await validatePasswordUser(req);

        logger.info(
            `Hasil validasi email ${JSON.stringify(emailValidationResult)}`,
        );

        logger.info(
            `Hasil validasi password ${JSON.stringify(
                passwordValidationResult,
            )}`,
        );

        if (
            emailValidationResult.errors.length > 0 ||
            passwordValidationResult.errors.length > 0
        ) {
            const errorObject = handleErrorValidationLogin({
                erremail: emailValidationResult.errors,
                errpassword: passwordValidationResult.errors,
            });

            // Kirim response balikan error
            handleResponseError(res, {
                message: 'Data tidak sesuai dan tidak valid',
                error: errorObject,
            });
        } else {
            // Lakukan proses komparasi data dari database dengan kiriman pengguna
            getUserDataFromDatabase(req.body.email, req.body.password, res);
        }
    } catch (err) {
        logger.error(`Error data ${JSON.stringify(err.stack)}`);

        handleResponseError(res, {
            message: 'Ditemukan kesalahan dalam mengelola permintaan data',
            errors: JSON.stringify(err.stack),
        });
    }
}

export default authLoginController;
