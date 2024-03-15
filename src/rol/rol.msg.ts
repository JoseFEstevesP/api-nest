import { Msg } from './rol';

export const rolMsg: Msg = {
  findOne: 'No se a encontrado ningún rol',
  register: 'Rol registrado exitosamente',
  validation: {
    disability: 'Este rol ya está registrado, pero yo deshabilitado',
    default: 'Este rol ya está registrado',
  },
  update: 'rol actualizado exitosamente',
  delete: 'Rol eliminado',
};
