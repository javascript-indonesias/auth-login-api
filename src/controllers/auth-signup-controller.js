import {
    runWorkerSignJwt,
    runWorkerHashPassword,
} from '../workers/index-service';
import {
    validateEmailUser,
    validatePasswordUser,
} from '../services/login-validator';

import {
    handleErrorSignup,
    handleErrorValidationSignup,
} from '../services/login-error-handler';
import { maxAgeToken, HASH_TYPE_BCRYPT } from '../utils/konstans-data';
import logger from '../utils/config-winston';
import { createUserDb } from '../repository/auth-repo';
import { secretjwt } from '../../config';

function handleResponseError(res, errobject, errCode = 400) {
    // Kirim pesan balikan error
    res.status(errCode).json(errobject);
}

async function createTokenJWTLogin(usermodel, res) {
    // Buat sign jwt dari password dan user id
    const workerdata = {
        usermodel,
        secretjwt,
    };

    let tokenData = {};
    try {
        tokenData = await runWorkerSignJwt(workerdata);
    } catch (err) {
        logger.error(
            `Gagal menandatangani data akses token ${JSON.stringify(err)}`,
        );
    }

    if (tokenData.accesstoken) {
        res.cookie('jwtToken', tokenData.accesstoken, {
            httpOnly: true,
            maxAge: maxAgeToken * 1000,
            sameSite: 'lax',
        });

        res.status(200).json({
            message: 'Sukses',
            // eslint-disable-next-line no-underscore-dangle
            userid: usermodel.userids,
            email: usermodel.email,
            accessToken: tokenData.accessToken,
        });
    } else {
        handleResponseError({ message: 'Gagal membuat data akses pengguna' });
    }
}

async function createDataPengguna(email, password, res) {
    // Buat data password dengvan di hash
    let errObject = {};
    let resultSaveDb = null;
    let passwordHashed = '';

    const workerData = {};
    workerData.typehash = HASH_TYPE_BCRYPT;
    workerData.plainpassword = password;

    // Jalankan hash di worker thread
    try {
        const hashResultObject = await runWorkerHashPassword(workerData);
        passwordHashed = hashResultObject.passwordhash;
    } catch (err) {
        logger.error(
            `Gagal membuat hashed password ${JSON.stringify(err.stack)}`,
        );
    }

    // Simpan ke database
    if (email && passwordHashed && passwordHashed.length > 5) {
        // Lanjutkan menyimpan ke database
        try {
            resultSaveDb = await createUserDb({
                email,
                password: passwordHashed,
            });
        } catch (err) {
            resultSaveDb = null;
            logger.error(
                `Gagal menyimpan data pengguna ${JSON.stringify(
                    err.stack,
                )} CODE ERROR ${err.code}`,
            );
            const errorData = new Error('Gagal simpan database');
            errorData.code = err.code;
            errObject = handleErrorSignup(errorData);
        }
    } else {
        // Gagal membuat hashed password
        errObject = handleErrorSignup(new Error('Gagal hashed password'));
    }

    if (resultSaveDb) {
        // Sukses simpan database, lanjutkan buat token JWT
        createTokenJWTLogin(resultSaveDb, res);
    }

    // Kirim response error jika terdapat error
    if (errObject.email || errObject.password) {
        handleResponseError(res, errObject);
    }
}

async function authSignupController(req, res) {
    // Proses pendaftaran di bagian proses signup
    let errorObject = null;
    try {
        const emailValidResult = await validateEmailUser(req);
        const passwordValidResult = await validatePasswordUser(req);

        if (
            emailValidResult.errors.length > 0 ||
            passwordValidResult.errors.length > 0
        ) {
            errorObject = handleErrorValidationSignup({
                erremail: emailValidResult.errors,
                errpassword: passwordValidResult.errors,
            });

            handleResponseError(res, errorObject);
        }

        // Jika tidak ditemui error validasi lanjutkan ke proses selanjutnya
        if (errorObject === null) {
            // Buat insert ke database
            const { email, password } = req.body;
            createDataPengguna(email, password, res);
        }
    } catch (err) {
        logger.error(`Error data ${JSON.stringify(err.stack)}`);
        handleResponseError(res, {
            status: false,
            message: 'Ditemukan kesalahan dalam mengelola permintaan data',
            errors: JSON.stringify(err.stack),
        });
    }
}

export default authSignupController;
