import logger from '../utils/config-winston';

/**
 * Error handling jika validasi proses login terjadi kesalahan
 * Untuk nilai username email dan password yang tidak valid
 */
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

/**
 * Error handling jika username dan password tidak cocok
 * atau data pengguna tidak ditemukan di dalam database
 */
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

/**
 * Jika terjadi kesalahan dalam validasi data yang diterima dari front end
 * Pada proses SignUp
 */
function handleErrorValidationSignup(errorObject) {
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

/**
 * Error handling jika terjadi kesalahan dalam alur proses signup
 * Terutama untuk pembuatan password, validasi JWT, username salah, dst
 */
function handleErrorSignup(error) {
    const errorMessage = error.message.toLowerCase();
    const errorObject = { email: '', password: '' };

    if (errorMessage.includes('useritem validation failed')) {
        const listObjectErrorValue = Object.values(error.errors);

        listObjectErrorValue.forEach((errValue) => {
            const { properties } = errValue;
            errorObject[properties.path] = properties.message;
        });
    }

    if (
        errorMessage.includes('gagal hashed') ||
        errorMessage.includes('simpan database')
    ) {
        errorObject.email = 'Ditemukan kesalahan dalam menyimpan data pengguna';
        errorObject.password =
            'Ditemukan kesalahan dalam menyimpan data pengguna';
    }

    // Jika mongoose menemukan ada data email yang duplikat
    if (error.code === 11000) {
        errorObject.email = 'Email telah dipakai untuk registrasi';
        errorObject.password = '';
    }

    logger.error(
        `Gagal Signup ${JSON.stringify(errorObject)} - ${errorMessage}`,
    );
    return errorObject;
}

export {
    handleErrorValidationLogin,
    handleErrorLoginDatabase,
    handleErrorSignup,
    handleErrorValidationSignup,
};
