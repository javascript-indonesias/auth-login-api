import jwt from 'jsonwebtoken';
import { parentPort } from 'worker_threads';

// verifikasi jwt secara asinkronus dan promise
function verifyJwtToken(tokenjwt, secretjwt) {
    return new Promise((resolve, reject) => {
        jwt.verify(
            tokenjwt,
            `${secretjwt}`,
            { algorithms: 'HS512' },
            (err, decodedtoken) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decodedtoken);
                }
            },
        );
    });
}

parentPort.on('message', (workerdata) => {
    const { tokenjwt, secretjwt } = workerdata;
    verifyJwtToken(tokenjwt, secretjwt)
        .then((decodedtoken) => {
            parentPort.postMessage(decodedtoken);
        })
        .catch((err) => {
            parentPort.postMessage({ error: err });
        });
});
