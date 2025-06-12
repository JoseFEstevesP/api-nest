export const globalMsg = {
	userUnauthorized: 'Usuario no autorizado',
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
		recoveryPassword:
			'Se envió el correo para recuperar la contraseña a la dirección:',
		activatedAccount:
			'Se envió el correo para la activación de la cuenta a la dirección:',
	},
	swagger: {
		title: 'Documentación API',
		description: 'Esta es la documentación de la API',
		version: '1.0',
		tags: {
			user: {
				name: 'User',
				description: 'Gestión de usuarios y autenticación',
			},
			rol: {
				name: 'Rol',
				description: 'Gestión de roles y permisos',
			},
			audit: {
				name: 'Audit',
				description: 'Registros de auditoría',
			},
			auth: {
				name: 'Auth',
				description: 'Autenticación de usuarios',
			},
		},
	},
	docs: {
		generateSuccess: 'Documentación generada en docs/swagger/swagger-spec.json',
	},
};
