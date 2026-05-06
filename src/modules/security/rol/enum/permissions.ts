const primaryPermissions = {
	super: 'SUPER',
	user: 'USER',
	rol: 'ROL',
	audit: 'AUDIT',
	company: 'COMPANY',
	system: 'SYSTEM',
	subscription: 'SUBSCRIPTION',
	payment: 'PAYMENT',
	paymentMethod: 'PAYMENT_METHOD',
};

const Permission = {
	/* Super usuario */
	super: primaryPermissions.super,

	/* Usuario */
	user: primaryPermissions.user,
	userProfile: `${primaryPermissions.user}_PROFILE`,
	userAdd: `${primaryPermissions.user}_ADD`,
	userRead: `${primaryPermissions.user}_READ`,
	userReadOne: `${primaryPermissions.user}_READ_ONE`,
	userUpdate: `${primaryPermissions.user}_UPDATE`,
	userDelete: `${primaryPermissions.user}_DELETE`,

	/* Roles */
	rol: primaryPermissions.rol,
	rolAdd: `${primaryPermissions.rol}_ADD`,
	rolRead: `${primaryPermissions.rol}_READ`,
	rolReadOne: `${primaryPermissions.rol}_READ_ONE`,
	rolUpdate: `${primaryPermissions.rol}_UPDATE`,
	rolDelete: `${primaryPermissions.rol}_DELETE`,

	/* Auditoría */
	audit: primaryPermissions.audit,
	auditRead: `${primaryPermissions.audit}_READ`,
	auditDelete: `${primaryPermissions.audit}_DELETE`,

	/* Empresa */
	company: primaryPermissions.company,
	companyAdd: `${primaryPermissions.company}_ADD`,
	companyRead: `${primaryPermissions.company}_READ`,
	companyReadOne: `${primaryPermissions.company}_READ_ONE`,
	companyUpdate: `${primaryPermissions.company}_UPDATE`,
	companyDelete: `${primaryPermissions.company}_DELETE`,

	/* Sistema */
	system: primaryPermissions.system,
	systemAdd: `${primaryPermissions.system}_ADD`,
	systemRead: `${primaryPermissions.system}_READ`,
	systemReadOne: `${primaryPermissions.system}_READ_ONE`,
	systemUpdate: `${primaryPermissions.system}_UPDATE`,
	systemDelete: `${primaryPermissions.system}_DELETE`,

	/* Suscripción */
	subscription: primaryPermissions.subscription,
	subscriptionAdd: `${primaryPermissions.subscription}_ADD`,
	subscriptionRead: `${primaryPermissions.subscription}_READ`,
	subscriptionReadOne: `${primaryPermissions.subscription}_READ_ONE`,
	subscriptionUpdate: `${primaryPermissions.subscription}_UPDATE`,
	subscriptionDelete: `${primaryPermissions.subscription}_DELETE`,

	/* Pago */
	payment: primaryPermissions.payment,
	paymentAdd: `${primaryPermissions.payment}_ADD`,
	paymentRead: `${primaryPermissions.payment}_READ`,
	paymentReadOne: `${primaryPermissions.payment}_READ_ONE`,
	paymentUpdate: `${primaryPermissions.payment}_UPDATE`,
	paymentDelete: `${primaryPermissions.payment}_DELETE`,

	/* Método de Pago */
	paymentMethod: primaryPermissions.paymentMethod,
	paymentMethodAdd: `${primaryPermissions.paymentMethod}_ADD`,
	paymentMethodRead: `${primaryPermissions.paymentMethod}_READ`,
	paymentMethodReadOne: `${primaryPermissions.paymentMethod}_READ_ONE`,
	paymentMethodUpdate: `${primaryPermissions.paymentMethod}_UPDATE`,
	paymentMethodDelete: `${primaryPermissions.paymentMethod}_DELETE`,
} as const;

type Permission = (typeof Permission)[keyof typeof Permission];

export { Permission };
