import { globalMsg } from 'src/globalMsg';
import { Rol } from 'src/rol/entities/rol.entity';
import { Permission } from 'src/rol/enum/permissions';
import { validatePermission } from '../../functions/validatePermissions';

export const deleteMiddleware = async ({ uidRol }: { uidRol: string }) => {
  const validate = await Rol.findOne({ where: { uid: uidRol } });
  if (
    !validatePermission({
      permissions: validate.permissions,
      permission: Permission.rolDelete,
    })
  ) {
    return { errors: [{ error: [{ error: globalMsg.userUnauthorized }] }] };
  }
};
