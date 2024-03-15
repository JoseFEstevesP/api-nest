import { validation } from 'src/functions/validation';
import { PromiseError, ResError } from 'src/types';
import { User } from '../entities/user.entities';
import { ValidateUser } from '../user';

export const validateUser = async ({
  models,
  msg,
}: ValidateUser<User>): PromiseError => {
  const errors: ResError = [];

  validation({ resValidation: models.isUserByUid, errors, msg, name: 'uid' });
  validation({ resValidation: models.isUserByCI, errors, msg, name: 'ci' });
  validation({
    resValidation: models.isUserByEmail,
    errors,
    msg,
    name: 'email',
  });

  if (errors.length > 0) {
    return { errors };
  }

  return null;
};
