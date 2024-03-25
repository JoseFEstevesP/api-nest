import { validatePermission } from 'src/functions/validatePermissions';
import { globalMsg } from 'src/globalMsg';
import { Rol } from 'src/rol/entities/rol.entity';

export const validateMiddleware = async ({
  uidRol,
  permission,
}: {
  uidRol: string;
  permission: string;
}) => {
  const validate = await Rol.findOne({ where: { uid: uidRol } });
  if (
    !validatePermission({
      permissions: validate.permissions,
      permission,
    })
  ) {
    return { errors: [{ error: [{ error: globalMsg.userUnauthorized }] }] };
  }
};
