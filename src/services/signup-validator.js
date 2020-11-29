// DOKUMENTASI VALIDATOR
// https://express-validator.github.io/docs/
// https://github.com/validatorjs/validator.js#validators
import { body, validationResult } from 'express-validator';

const validateReqSignup = [
    body('email')
        .trim()
        .notEmpty({ checkFalsy: true, nullable: false })
        .withMessage('Email tidak boleh kosong')
        .isLength({ min: 5 })
        .withMessage('Email tidak boleh kosong')
        .isEmail()
        .withMessage('Silahkan isi alamat email dengan benar')
        .escape(),
    body('password')
        .trim()
        .notEmpty({ checkFalsy: true, nullable: false })
        .withMessage('Kata sandi tidak boleh kosong')
        .isLength({ min: 6 })
        .withMessage('Kata sandi minimal 6 karakter')
        .escape(),
];

const validateResultRequest = (req) => {
    const errorsResult = validationResult(req);
    return errorsResult;
};

export { validateReqSignup, validateResultRequest };
