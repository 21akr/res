import joi from 'joi';

export class UserSignUpParams {
  id: string;
  password: string;

  constructor(params) {
    this.id = params.id;
    this.password = params.password;
  }

  async validate() {
    return await UserSignUpParamsSchema.validateAsync(this);
  }
}

export const UserSignUpParamsSchema = joi.object<UserSignUpParams>({
  id: joi.string().trim().required(),
  password: joi.string().trim().required(),
});
