import { Msg } from './user';

export const userMsg: Msg = {
  findOne: 'No se a encontrado ningún usuario',
  register: 'Usuario registrado exitosamente',
  validation: {
    disability: 'Este usuario ya está registrado, pero está deshabilitado',
    default: 'Este usuario ya está registrado',
  },
  login: {
    status: 'Este ususario fue eliminado',
    error: 'Credenciales incorrectas',
  },
  update: 'Usuario actualizado exitosamente',
  profile: {
    data: 'Datos del usuario actualizados',
    email: 'Correo electronico actualizado',
    password: 'Contraseña actualizada',
    passwordError: 'Contraseña incorrecta',
    error: 'Error al actualizar los datos del usuario',
  },
  unregister: 'Usuario eliminado',
};
