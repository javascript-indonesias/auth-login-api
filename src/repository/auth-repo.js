import UserItem from './model/user-model';
import { generateMixedID } from '../utils/id-generators';

async function createUser(useritem) {
    try {
        const iduser = await generateMixedID();
        const userdb = await UserItem.create({
            userids: iduser,
            email: useritem.email,
            password: useritem.password,
        });
        return Promise.resolve(userdb);
    } catch (err) {
        return Promise.reject(err);
    }
}

async function createUserDb(useritem) {
    const userids = await generateMixedID();
    const { email, password } = useritem;

    const userItem = new UserItem({
        userids,
        email,
        password,
    });

    return userItem
        .save()
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

async function getDataUser(email) {
    try {
        const userData = await UserItem.findOne({ email: `${email}` }).exec();
        if (userData) {
            return Promise.resolve(userData);
        }
        return Promise.reject(
            new Error(`Email pengguna ${email} tidak ditemukan`),
        );
    } catch (err) {
        return Promise.reject(
            new Error(
                `Email pengguna ${email} tidak ditemukan ${JSON.stringify(
                    err,
                )}`,
            ),
        );
    }
}

async function getDataUserByUserId(userid) {
    try {
        const userDb = await UserItem.find({ userids: userid }).exec();
        if (userDb && userDb.length > 0) {
            return Promise.resolve(userDb[0]);
        }
        return Promise.reject(new Error(`User ID ${userid} tidak ditemukan`));
    } catch (err) {
        return Promise.reject(
            new Error(
                `User ID ${userid} tidak ditemukan ${JSON.stringify(err)}`,
            ),
        );
    }
}

async function getDataUserByDocumentId(docid) {
    try {
        const userDb = await UserItem.findById(docid).exec();
        if (userDb) {
            return Promise.resolve(userDb);
        }
        return Promise.reject(
            new Error(`Pengguna dengan ID ${docid} tidak ditemukan`),
        );
    } catch (err) {
        return Promise.reject(
            new Error(
                `Pengguna dengan ID ${docid} tidak ditemukan ${JSON.stringify(
                    err,
                )}`,
            ),
        );
    }
}

export {
    createUser,
    createUserDb,
    getDataUser,
    getDataUserByDocumentId,
    getDataUserByUserId,
};
