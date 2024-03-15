import { globalMsg } from 'src/globalMsg';
import { Rol } from 'src/rol/entities/rol.entity';
import { Permission } from 'src/rol/enum/permissions';
import { validatePermission } from '../../functions/validatePermissions';

export const searchMiddleware = async ({ uidRol }: { uidRol: string }) => {
  const validate = await Rol.findOne({ where: { uid: uidRol } });
  if (
    !validatePermission({
      permissions: validate.permissions,
      permission: Permission.userSearch,
    })
  ) {
    return { errors: [{ error: [{ error: globalMsg.userUnauthorized }] }] };
  }
};
