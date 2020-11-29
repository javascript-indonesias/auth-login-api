// DOKUMENTASI VALIDATOR
// https://express-validator.github.io/docs/
// https://github.com/validatorjs/validator.js#validators
import { check, validationResult } from 'express-validator';

const validateEmailUser = async (req) => {
    const reqResult = await check('email')
        .trim()
        .notEmpty({ checkFalsy: true, nullable: false })
        .withMessage('Email tidak boleh kosong')
        .isEmail()
        .withMessage('Silahkan isi alamat email dengan benar')
        .escape()
        .run(req);

    return new Promise((resolve) => {
        const reqResultObject = JSON.parse(JSON.stringify(reqResult));
        resolve(reqResultObject);
    });
};

const validatePasswordUser = async (req) => {
    const reqResult = await check('password')
        .trim()
        .notEmpty({ checkFalsy: true, nullable: false })
        .withMessage('Kata sandi tidak boleh kosong')
        .isLength({ min: 6 })
        .withMessage('Kata sandi minimal 6 karakter')
        .escape()
        .run(req);

    return new Promise((resolve) => {
        const objectResult = JSON.parse(JSON.stringify(reqResult));
        resolve(objectResult);
    });
};

const validateResultRequest = (req) => {
    const errorsResult = validationResult(req);
    return errorsResult;
};

export { validateEmailUser, validatePasswordUser, validateResultRequest };
