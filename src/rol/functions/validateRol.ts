import { validation } from 'src/functions/validation';
import { PromiseError, ResError } from 'src/types';
import { Rol } from '../entities/rol.entity';
import { ValidateRol } from '../rol';

export const validateRol = async ({
  models,
  msg,
}: ValidateRol<Rol>): PromiseError => {
  const errors: ResError = [];

  validation({ resValidation: models.isRolByUid, errors, msg, name: 'uid' });
  validation({ resValidation: models.isRolByName, errors, msg, name: 'ci' });

  if (errors.length > 0) {
    return { errors };
  }

  return null;
};
