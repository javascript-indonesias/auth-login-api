// Worker thread untuk sign JWT token
import { parentPort } from 'worker_threads';
import jwt from 'jsonwebtoken';

// Membuat JWT Token
function createJwtToken(usermodel, secretjwt) {
    // Membuat token jwt dari user id
    // Kadaluarsa dalam 1 jam / 60 menit
    return new Promise((resolve, reject) => {
        jwt.sign(
            { id: usermodel.id },
            `${secretjwt}`,
            {
                algorithm: 'HS512',
                expiresIn: 60 * 60,
            },
            (error, token) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ accesstoken: token, datauser: usermodel });
                }
            },
        );
    });
}

parentPort.on('message', (workerdata) => {
    const { usermodel, secretjwt } = workerdata;
    createJwtToken(usermodel, secretjwt)
        .then((datatoken) => {
            parentPort.postMessage(datatoken);
        })
        .catch((err) => {
            parentPort.postMessage({ error: err });
        });
});
