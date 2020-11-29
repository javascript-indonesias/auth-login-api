// Contoh menjalankan proses komputasi berat
// di Node JS dengan Worker Threads
// Proses berat tidak menghambat dan blocking main event loop
// Sehingga aplikasi tetap responsif ketika proses kalkulasi
// komputasi berat di jalankan
import { parentPort } from 'worker_threads';
import bcrypt from 'bcrypt';
import argon2 from 'argon2';

const saltRounds = 15;

// Mongoose hooks, menjalankan fungsi sebelum dan sesudah
// Aksi database middleware sebelum database disimpan
// Cara lain bisa dilihat disini
// DOCUMENTATION https://blog.logrocket.com/building-a-password-hasher-in-node-js/
// DOCUMENTATION https://www.toptal.com/nodejs/secure-rest-api-in-nodejs
async function createHashPasswordBcrypt(plainPassword) {
    // Membuat hash dengan bcrypt
    try {
        const salts = await bcrypt.genSalt(saltRounds);
        const hashedPasswords = await bcrypt.hash(plainPassword, salts);
        return Promise.resolve(hashedPasswords);
    } catch (err) {
        return Promise.reject(err);
    }
}

async function createHashArgon(plainPassword) {
    // Membuat hash dengan argon2
    try {
        const hashedPasswords = await argon2.hash(plainPassword, {
            hashLength: 36,
            timeCost: 5,
            type: argon2.argon2id,
        });
        return Promise.resolve(hashedPasswords);
    } catch (err) {
        return Promise.reject(err);
    }
}

// Listener message untuk menerima pesan dari main thread
parentPort.on('message', (workerdata) => {
    // Terima pesan proses dan jalankan di thread proses terpisah
    const typeIdHash = workerdata.typehash;
    if (typeIdHash === 'bcrypt') {
        createHashPasswordBcrypt(workerdata.plainpassword)
            .then((result) => {
                parentPort.postMessage({ passwordhash: result });
            })
            .catch((err) => {
                parentPort.postMessage({ passwordhash: '', error: err });
            });
    } else {
        createHashArgon(workerdata.plainpassword)
            .then((result) => {
                parentPort.postMessage({ passwordhash: result });
            })
            .catch((err) => {
                parentPort.postMessage({ passwordhash: '', error: err });
            });
    }
});
