import { runWorkerVerifyJwt } from '../workers/index-service';
import { getDataUserByUserId } from '../repository/auth-repo';
import { secretjwt } from '../../config';
import logger from '../utils/config-winston';

function requireAuthTokenMiddleware(req, res, next) {
    // Cek token apakah masih berlaku atau tidak
    const tokenjwt = req.cookies.jwtToken;

    // Cek apakah token tersedia atau tidak
    if (tokenjwt) {
        // Lakukan proses verifikasi token
        const workerData = { tokenjwt, secretjwt };
        runWorkerVerifyJwt(workerData)
            .then((tokenobject) => {
                // Sukses verifikasi JSON lanjutkan ke router berikutnya
                logger.info(
                    `Sukses verifikasi token data ${JSON.stringify(
                        tokenobject,
                    )}`,
                );
                next();
            })
            .catch((errors) => {
                logger.error(`Error verifikasi data ${JSON.stringify(errors)}`);
                res.redirect('/login');
            });
    } else {
        // Redirect ke halaman login jika tidak ada token
        res.redirect('/login');
    }
}

function checkStatusLoginUserMiddleware(req, res, next) {
    // Cek status user apakah login atau tidak
    const tokenjwt = req.cookies.jwtToken;
    if (tokenjwt) {
        // Lakukan proses verifikasi token
        const workerData = { tokenjwt, secretjwt };
        runWorkerVerifyJwt(workerData)
            .then((decodedtokenobject) => {
                // Sukses verifikasi JSON lanjutkan ke router berikutnya
                logger.info(
                    `Sukses verifikasi token cek status login ${JSON.stringify(
                        decodedtokenobject,
                    )}`,
                );

                // Data token ditemukan, ambil id nya.
                const userid = decodedtokenobject.token.id;
                return getDataUserByUserId(userid);
            })
            .then((userdata) => {
                // User data ditemukan
                logger.info(`User data ditemukan ${JSON.stringify(userdata)}`);
                if (userdata) {
                    res.locals.user = userdata;
                } else {
                    res.locals.user = {};
                }
                next();
            })
            .catch((errors) => {
                logger.error(`Error verifikasi data ${JSON.stringify(errors)}`);
                res.redirect('/login');
            });
    } else {
        res.locals.user = {};
        next();
    }
}

export { requireAuthTokenMiddleware, checkStatusLoginUserMiddleware };
