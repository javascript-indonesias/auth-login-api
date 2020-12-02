import logger from '../utils/config-winston';

function handleErrorValidationLogin(errorObject) {
    const {
        erremail: arrayErrEmail,
        errpassword: arrayErrPassword,
    } = errorObject;
    const errObjectParsed = { email: '', password: '' };

    if (arrayErrEmail.length > 0) {
        let stringMessage = '';
        arrayErrEmail.forEach((errvalue) => {
            const { msg } = errvalue;
            stringMessage += `${msg}. `;
        });
        errObjectParsed.email = stringMessage;
    }

    if (arrayErrPassword.length > 0) {
        let stringMessage = '';
        arrayErrPassword.forEach((errvalue) => {
            const { msg } = errvalue;
            stringMessage += `${msg}. `;
        });
        errObjectParsed.password = stringMessage;
    }

    return errObjectParsed;
}

function handleErrorLoginDatabase(error) {
    const errMessage = error.message;
    const errObjectParsed = { email: '', password: '' };

    if (
        errMessage.toLowerCase().includes('email pengguna') &&
        errMessage.toLowerCase().includes('tidak ditemukan')
    ) {
        errObjectParsed.email = errMessage;
    }

    if (errMessage.toLowerCase().includes('kata sandi')) {
        errObjectParsed.password = errMessage;
    }

    return errObjectParsed;
}

function handleErrorSignup(error) {
    const errorMessage = error.message.toLowerCase();
    const errorObject = { email: '', password: '' };

    // Jika mongoose menemukan ada data email yang duplikat
    if (error.code === 11000) {
        errorObject.email = 'Email telah dipakai untuk registrasi';
    }

    if (errorMessage.includes('useritem validation failed')) {
        const listObjectErrorValue = Object.values(error.errors);

        listObjectErrorValue.forEach((errValue) => {
            const { properties } = errValue;
            errorObject[properties.path] = properties.message;
        });
        logger.warn(JSON.stringify(errorObject));
    }

    // Login email salah
    if (errorMessage.includes('alamat email')) {
        errorObject.email = errorMessage;
    }

    // Login password salah
    if (errorMessage.includes('kata sandi')) {
        errorObject.password = errorMessage;
    }

    if (
        errorMessage.includes('gagal hashed') ||
        errorMessage.includes('simpan database')
    ) {
        errorObject.email = 'Ditemukan kesalahan dalam menyimpan data pengguna';
        errorObject.password =
            'Ditemukan kesalahan dalam menyimpan data pengguna';
    }

    logger.error(error.stack);
    return errorObject;
}

export {
    handleErrorValidationLogin,
    handleErrorSignup,
    handleErrorLoginDatabase,
};
