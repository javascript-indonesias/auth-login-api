import { isEmail } from 'validator';
import logger from '../utils/config-winston';

const emailValidators = (value) => {
    const isEmailOK = isEmail(value);
    logger.info(`Email validation ${value} is ${isEmailOK}`);
    if (isEmailOK) {
        return Promise.resolve(true);
    }
    return Promise.reject(
        new Error(`Email tidak benar, silahkan ${value} diperbaiki.`),
    );
};

export default emailValidators;
