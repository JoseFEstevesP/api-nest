export const userMessages = {
	dto: {
		arrayValue: 'Este valor debe ser un array',
		uid: {
			valid: 'El campo UID no es un UUID válido',
			empty: 'El campo UID no puede estar vacío',
		},
		empty: 'Este campo no puede estar vacío',
		defined: 'Este campo no está definido',
		stringValue: 'Este campo debe ser de tipo cadena de texto',
		arrayStringValue: 'Este campo debe ser un array de cadenas de texto',
		status: 'Este campo debe ser de tipo booleano',
		enumValue: 'Valor no válido',
		lengthValue: 'Este campo debe tener entre 3 y 255 caracteres',
	},
	log: {
		passwordError: 'La contraseña no coincide con la confirmación.',
		create: 'Creando usuario...',
		createSuccess: 'Usuario creado exitosamente...',
		sessionExisting: 'Sesión existente...',
		findOne: 'Buscando usuario...',
		findAll: 'Buscando todos los usuarios...',
		update: 'Actualizando usuario...',
		profile: 'Buscando perfil...',
		updateProfile: 'Actualizando perfil...',
		updateProfileEmail: 'Actualizando email de perfil...',
		updateProfilePassword: 'Actualizando contraseña de perfil...',
		unregister: 'Desregistrando usuario...',
		remove: 'Eliminando usuario...',
		recoveryVerifyPassword: 'Verificando contraseña de recuperación...',
		recoveryPassword: 'Recuperando contraseña...',
		newPassword: 'Creando nueva contraseña...',
		activatedAccount: 'Activando cuenta...',
		updatePassword: 'Actualizando contraseña...',
		errorValidator: 'Error en validación...',
		emailActivated: 'Email de activación enviado...',
		attempt: 'Bloqueando cuenta...',
		loginPassword: 'Contraseña de inicio de sesión no encontrada...',
		userError: 'Usuario no encontrado...',
		profileSuccess: 'Perfil actualizado exitosamente...',
		findOneSuccess: 'Usuario encontrado exitosamente...',
		findAllSuccess: 'Usuarios encontrados exitosamente...',
		updateSuccess: 'Usuario actualizado exitosamente...',
		unregisterSuccess: 'Usuario eliminado exitosamente...',
		relationError: 'El usuario esta relacionado con otros datos',
		userErrorActiveAccount: 'La cuenta de usuario no está activada.',
		recoveryPasswordSuccess: 'Contraseña recuperada exitosamente...',
		newPasswordSuccess: 'Nueva contraseña establecida exitosamente...',
		userErrorNewPassword: 'Las contraseñas proporcionadas no coinciden.',
		recoveryVerifyPasswordSuccess:
			'Verificación de recuperación de contraseña exitosa...',
		activatedAccountSuccess: 'Cuenta de usuario activada exitosamente...',
		refreshTokenUser: 'El token no es igual al token actual.',
		refreshToken: 'Token de refresco no encontrado...',
	},
	msg: {
		registerDefault:
			'Usuario registrado exitosamente. Revise su correo para activar la cuenta.',
		registerAdmin: 'Usuario registrado',
		unregister: 'Usuario eliminado.',
		update: 'Usuario actualizado exitosamente.',
		verifyPassword: `Contraseña actualizada.`,
		userError: 'Usuario no encontrado.',
		attempt: `Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos. Espere 24 horas y vuelva a intentarlo.`,
		credential: 'Credenciales no válidos.',
		findOne: 'No se ha encontrado ningún usuario.',
		logout: 'Sesión cerrada exitosamente.',
		userType: 'El usuario selecionado no es una administrador',
		passwordError: 'Credenciales no válidas.',
		recoveryPassword: 'Código enviado al correo electrónico.',
		newPassword: 'Contraseña actualizada exitosamente.',
		newPasswordChanged: 'Contraseña cambiada exitosamente.',
		activationAccount: `Cuenta activada. Inicie sesión para continuar.`,
		refreshToken: 'No se encontró el token de refresco.',
		login: {
			status: 'El usuario no está activo.',
		},
	},
	validation: {
		disability:
			'Este usuario ya está registrado, pero está deshabilitado. Por favor, póngase en contacto con los administradores.',
		default: 'Este usuario ya está registrado.',
		activatedAccount: 'La cuenta de usuario no está activada.',
		dto: {
			token: 'El campo token no es válido.',
			email: 'El campo email no es válido.',
			phone: `El número de teléfono ingresado no es válido.
Asegúrate de que el número tenga el formato correcto:
- Debe comenzar con el código de país (+58 o 58).
- Debe incluir un código de área de 3 dígitos (por ejemplo, 212, 414).
- Debe tener un total de 11 dígitos.
Ejemplo de un número válido: +582412345678 o 0412345678.`,
			password:
				'La contraseña debe tener un mínimo de 8 caracteres y contener al menos 1 mayúscula, 1 minúscula, 1 número y un carácter especial.',
			code: {
				length: 'El campo code no puede tener más de 16 caracteres.',
				invalidCharacters:
					'El campo code no puede tener caracteres no numéricos.',
			},
			passwordMatch: 'Las contraseñas no coinciden.',
		},
	},
};
