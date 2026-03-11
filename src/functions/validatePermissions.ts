import { Permission } from '@/modules/security/rol/enum/permissions';

export const validatePermission = ({
	permissions,
	permission,
}: {
	permissions: string[];
	permission: string;
}) => {
	const validate = permissions.some(
		item =>
			(!permission.split('_')[0] && item === permission) ||
			item === Permission.super,
	);
	return validate;
};
