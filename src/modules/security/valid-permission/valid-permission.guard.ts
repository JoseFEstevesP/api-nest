import { throwHttpExceptionUnique } from '@/functions/throwHttpException';
import { validatePermission } from '@/functions/validatePermissions';
import { globalMsg } from '@/globalMsg';
import { RolService } from '@/modules/security/rol/rol.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly rolService: RolService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const requiredPermission = this.reflector.get<string>(
			'valid-permission',
			context.getHandler(),
		);

		if (!requiredPermission) {
			return true;
		}

		const uidRol = request.user?.uidRol;

		const rol = await this.rolService.findOne({ uid: uidRol });

		if (
			!validatePermission({
				permissions: rol?.permissions || [],
				permission: requiredPermission,
			})
		) {
			throwHttpExceptionUnique(globalMsg.userUnauthorized);
		}

		return true;
	}
}
