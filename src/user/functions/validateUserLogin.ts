import { validationLogin } from 'src/user/functions/validationLogin';
import { PromiseError, ResError } from 'src/types';
import { User } from '../entities/user.entities';
import { ValidateUser } from '../user';

export const validateUserLogin = async ({
  models,
  msg,
}: ValidateUser<User>): PromiseError => {
  const errors: ResError = [];

  validationLogin({
    resValidation: models.isUserByCI,
    errors,
    msg,
    name: 'uid',
  });

  if (errors.length > 0) {
    return { errors };
  }

  return null;
};
