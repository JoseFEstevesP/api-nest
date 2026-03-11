import { ReqUidDTO } from '@/dto/ReqUid.dto';
import {
	ApiErrorResponse,
	ApiUnauthorizedResponse,
	ApiTooManyRequestsResponse,
} from '@/dto/api-response.dto';
import { ThrottleAuth } from '@/decorators/rate-limit.decorator';
import { dataInfoJWT } from '@/functions/dataInfoJWT';
import { User } from '@/modules/security/user/entities/user.entity';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { authMessages } from './auth.messages';
import { AuthLoginDTO } from './dto/authLogin.dto';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { GoogleLoginUseCase } from './use-case/google-login.use-case';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(
		private readonly loginUseCase: LoginUseCase,
		private readonly logoutUseCase: LogoutUseCase,
		private readonly refreshTokenUseCase: RefreshTokenUseCase,
		private readonly googleLoginUseCase: GoogleLoginUseCase,
		private readonly configService: ConfigService,
	) {}

	@ApiOperation({
		summary: 'Iniciar sesión',
		description: `
## Descripción
Autentica un usuario y devuelve tokens de acceso.

## Permisos requeridos
Ninguno - Endpoint público

## Ejemplo de petición
\`\`\`json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
\`\`\`
		`,
	})
	@ApiResponse({
		status: 201,
		description: 'Login exitoso - Devuelve tokens en cookies',
		example: {
			msg: 'Inicio de sesión exitoso',
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Datos de entrada inválidos',
		type: ApiErrorResponse,
	})
	@ApiResponse({
		status: 401,
		description: 'Credenciales incorrectas',
		type: ApiUnauthorizedResponse,
	})
	@ApiResponse({
		status: 429,
		description: 'Demasiadas peticiones',
		type: ApiTooManyRequestsResponse,
	})
	@HttpCode(HttpStatus.CREATED)
	@ThrottleAuth()
	@Post('/login')
	async login(
		@Body() data: AuthLoginDTO,
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request & ReqUidDTO,
	) {
		this.logger.log(`system - ${authMessages.log.login}`);
		await this.loginUseCase.execute({ data, res, loginInfo: dataInfoJWT(req) });
		return { msg: authMessages.msg.loginSuccess };
	}

	@ApiOperation({
		summary: 'Cerrar sesión',
		description: `
## Descripción
Cierra la sesión del usuario actual invalidando el token de refresh.

## Permisos requeridos
- Bearer Token (JWT)
		`,
	})
	@ApiResponse({
		status: 200,
		description: 'Logout exitoso',
		example: {
			msg: 'Sesión cerrada exitosamente',
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Token no válido o expirado',
		type: ApiUnauthorizedResponse,
	})
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('/logout')
	async logout(
		@Res({ passthrough: true }) res: Response,
		@Req() req: ReqUidDTO,
	) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${authMessages.log.logout}`);
		await this.logoutUseCase.execute({ uid, res, dataLog });
		return { msg: 'Sesión cerrada exitosamente' };
	}

	@ApiOperation({
		summary: 'Renovar token de acceso',
		description: `
## Descripción
Renueva el token de acceso usando el token de refresh guardado en cookies.

## Permisos requerions
Ninguno - Requiere cookie de refresh token

## Notas
- El refresh token se envía automáticamente en cookies
- Si el refresh token es válido, devuelve nuevos access y refresh tokens
		`,
	})
	@ApiResponse({
		status: 201,
		description: 'Token refrescado exitosamente',
		example: {
			msg: 'Token actualizado',
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Refresh token inválido o expirado',
		type: ApiUnauthorizedResponse,
	})
	@ApiResponse({
		status: 429,
		description: 'Demasiadas peticiones',
		type: ApiTooManyRequestsResponse,
	})
	@HttpCode(HttpStatus.CREATED)
	@ThrottleAuth()
	@Post('/refresh-token')
	async refreshToken(
		@Req() req: Request & ReqUidDTO,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.refreshTokenUseCase.execute({
			req,
			res,
			loginInfo: dataInfoJWT(req),
		});
		return { msg: 'Token actualizado' };
	}

	@ApiOperation({
		summary: 'Login con Google (Inicio)',
		description: `
## Descripción
Inicia el proceso de autenticación con Google OAuth.

## Permisos requeridos
Ninguno
		`,
	})
	@ApiResponse({ status: 200, description: 'Redirección a Google OAuth' })
	@Get('google')
	async googleLogin() {
		const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
		if (!clientId) {
			return { msg: 'Google OAuth not configured' };
		}
	}

	@ApiOperation({
		summary: 'Login con Google (Callback)',
		description: `
## Descripción
Maneja el callback de Google OAuth después de la autenticación.

## Permisos requeridos
Ninguno
		`,
	})
	@ApiResponse({ status: 200, description: 'Login con Google exitoso' })
	@Get('google/callback')
	async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
		const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
		if (!clientId) {
			return { msg: 'Google OAuth not configured' };
		}
		this.googleLoginUseCase.execute({
			user: req.user as User,
			res,
			loginInfo: dataInfoJWT(req),
		});
	}
}
