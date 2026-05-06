import {
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredException } from '@/exceptions/token-expired.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest<TUser = any>(
		err: any,
		user: TUser,
		info: any,
		_context: ExecutionContext,
	) {
		if (info?.name === 'TokenExpiredError') {
			throw new TokenExpiredException('access');
		}

		if (err || !user) {
			throw err || new UnauthorizedException('No autenticado');
		}

		return user;
	}
}