import { Schema, model } from 'mongoose';
import emailValidators from '../../services/email-validators';
import logger from '../../utils/config-winston';
import { generateMixedID } from '../../utils/id-generators';

// Mongoose hooks, menjalankan fungsi sebelum dan sesudah
// Aksi database middleware sebelum database disimpan
// Cara lain bisa dilihat disini
// DOCUMENTATION https://blog.logrocket.com/building-a-password-hasher-in-node-js/
// DOCUMENTATION https://www.toptal.com/nodejs/secure-rest-api-in-nodejs
const userSchema = new Schema(
    {
        userids: {
            type: String,
            required: [true, 'ID perlu dibuat'],
            default: '',
            unique: 'true',
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'Silahkan isi alamat email dengan benar'],
            default: '',
            unique: 'true',
            lowercase: true,
            // validate: [isEmail, 'Silahkan isi email dengan benar'],
            validate: {
                validator: emailValidators,
            },
        },
        password: {
            type: String,
            required: [true, 'Silahkan isi kata sandi dengan benar'],
            default: '',
            minlength: [6, 'Kata sandi minimal 6 karakter'],
        },
    },
    {
        timestamps: true,
    },
);

// Buat random ID sebelum disimpan
function preSaveDataUser() {
    const userId = generateMixedID();
    this.userids = userId;
    logger.warn(
        `Save data user ${this.userids}  ${this.email} ${this.password}`,
    );
    return Promise.resolve(this);
}

function debuggerQuery() {
    // Query tidak ada return this seperti save
    logger.info('Query data dilakukan');
}

// https://mongoosejs.com/docs/middleware.html#pre\
// Aksi yang dijalankan sebelum  data disimpan
userSchema.pre('save', preSaveDataUser);
userSchema.pre('findOne', debuggerQuery);
// Aksi database dijalankan setelah proses save di jalankan
userSchema.post('save', (docs, next) => {
    logger.info(`Data user berhasil disimpan ${JSON.stringify(docs)}`);
    next();
});

const UserItem = model('useritem', userSchema);
export default UserItem;
