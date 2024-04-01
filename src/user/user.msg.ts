export const userMsg = {
  findOne: 'No se a encontrado ningún usuario',
  register:
    'Usuario registrado exitosamente, revise su correo para activar la cuenta',
  validation: {
    disability:
      'Este usuario ya está registrado, pero está deshabilitado por favor póngase en contactos con los administradores',
    default: 'Este usuario ya está registrado',
    activatedAccount:
      'Este usuario ya está registrado, pero esta cuenta no a sido activada',
  },
  login: {
    status: 'Este ususario fue eliminado',
    activatedAccount:
      'Este usuario no a sido activado, verifique su correo electrónico.',
    error: 'Credenciales incorrectas',
    f2a: 'revise su correo para terminar de iniciar sesión.',
    f2aValid: 'Este código no es correcto o ya paso el tiempo de expiración.',
  },
  update: 'Usuario actualizado exitosamente',
  profile: {
    data: 'Datos del usuario actualizados',
    email: 'Correo electronico actualizado',
    password: 'Contraseña actualizada',
    passwordError: 'Contraseña incorrecta',
    error: 'Error al actualizar los datos del usuario',
  },
  recoveryPassword: 'Código enviado al correo',
  unregister: 'Usuario eliminado',
};
