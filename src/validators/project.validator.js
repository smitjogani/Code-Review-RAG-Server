import Joi from 'joi';

const createProjectSchema = Joi.object({
    name: Joi.string().required().messages({ 'any.required': 'Project name is required' }),
    type: Joi.string().valid('zip', 'github').required(),
    language: Joi.string().required(),
    framework: Joi.string().required(),
    tools: Joi.string().allow('', null),
    repoUrl: Joi.string().uri().when('type', { is: 'github', then: Joi.required() }),
    filePath: Joi.string().when('type', { is: 'zip', then: Joi.required() })
});

const validateProject = (data) => {
    return createProjectSchema.validate(data, { abortEarly: false });
};

export { validateProject };
