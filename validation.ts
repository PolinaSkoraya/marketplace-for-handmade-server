import Joi from '@hapi/joi'

//register buyer
export const registerBuyerValidation  = data => {
    const schemaValid = Joi.object({
        name: Joi.string()
            .min(6)
            .required(),
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required()
    });
    return schemaValid.validate(data);
}

export const loginBuyerValidation  = data => {
    const schemaValid = Joi.object({
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required()
    });
    return schemaValid.validate(data);
}

