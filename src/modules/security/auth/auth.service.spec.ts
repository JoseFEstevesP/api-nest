import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { msg } from './msg';
describe('AuthService', () => {
	let service: AuthService;
	let userService: any;
	let jwtService: any;
	let auditService: any;
	let configService: any;
	const mockUser = {
		uid: 'user-uid',
		ci: '12345678',
		first_name: 'John',
		first_surname: 'Doe',
		password: 'hashedPassword',
		uidRol: 'role-uid',
		attemptCount: 0,
		update: vi.fn(),
	};
	const mockLoginInfo = {
		ip: '127.0.0.1',
		userAgent: 'test-agent',
		userPlatform: 'test-platform',
	};
	const mockResponse = {
		cookie: vi.fn().mockReturnThis(),
		clearCookie: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};
	const mockRequest = {
		cookies: {
			refreshToken: 'valid-refresh-token',
		},
	};
	beforeEach(() => {
		userService = {
			findUserForAuth: vi.fn(),
			findUserById: vi.fn(),
			validateAttempt: vi.fn(),
		};
		jwtService = {
			signAsync: vi.fn(),
		};
		auditService = {
			create: vi.fn(),
			remove: vi.fn(),
			findOne: vi.fn(),
		};
		configService = {
			get: vi.fn(),
		};
		service = new AuthService(
			userService,
			jwtService,
			auditService,
			configService,
		);
		vi.clearAllMocks();
	});
	describe('login', () => {
		const loginData = {
			ci: '12345678',
			password: 'password123',
		};
		it('debería iniciar sesión exitosamente con credenciales válidas', async () => {
			userService.findUserForAuth.mockResolvedValue(mockUser);
			vi.spyOn(await import('bcrypt'), 'compare').mockResolvedValue(
				true as never,
			);
			jwtService.signAsync
				.mockResolvedValueOnce('access-token')
				.mockResolvedValueOnce('refresh-token');
			auditService.create.mockResolvedValue({});
			configService.get.mockReturnValue('development');
			await service.login({
				data: loginData,
				res: mockResponse as any,
				loginInfo: mockLoginInfo,
			});
			expect(userService.findUserForAuth).toHaveBeenCalledWith('12345678');
			expect(mockUser.update).toHaveBeenCalledWith({ attemptCount: 0 });
			expect(auditService.create).toHaveBeenCalled();
			expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
			expect(mockResponse.json).toHaveBeenCalledWith({
				msg: msg.msg.loginSuccess,
			});
		});
		it('debería lanzar error si el usuario no es encontrado', async () => {
			userService.findUserForAuth.mockResolvedValue(null);
			await expect(
				service.login({
					data: loginData,
					res: mockResponse as any,
					loginInfo: mockLoginInfo,
				}),
			).rejects.toThrow();
		});
		it('debería lanzar error y validar intento si la contraseña es incorrecta', async () => {
			userService.findUserForAuth.mockResolvedValue(mockUser);
			vi.spyOn(await import('bcrypt'), 'compare').mockResolvedValue(
				false as never,
			);
			await expect(
				service.login({
					data: loginData,
					res: mockResponse as any,
					loginInfo: mockLoginInfo,
				}),
			).rejects.toThrow();
			expect(userService.validateAttempt).toHaveBeenCalledWith({
				user: mockUser,
			});
		});
		it('debería lanzar error si la creación de auditoría falla', async () => {
			userService.findUserForAuth.mockResolvedValue(mockUser);
			vi.spyOn(await import('bcrypt'), 'compare').mockResolvedValue(
				true as never,
			);
			jwtService.signAsync
				.mockResolvedValueOnce('access-token')
				.mockResolvedValueOnce('refresh-token');
			auditService.create.mockRejectedValue(new Error('Audit error'));
			await expect(
				service.login({
					data: loginData,
					res: mockResponse as any,
					loginInfo: mockLoginInfo,
				}),
			).rejects.toThrow();
		});
	});
	describe('logout', () => {
		it('debería cerrar sesión exitosamente', async () => {
			userService.findUserById.mockResolvedValue(mockUser);
			auditService.remove.mockResolvedValue({});
			await service.logout({
				uid: 'user-uid',
				res: mockResponse as any,
				dataLog: 'test-log',
			});
			expect(userService.findUserById).toHaveBeenCalledWith('user-uid');
			expect(auditService.remove).toHaveBeenCalledWith(
				{ uidUser: mockUser.uid },
				'test-log',
			);
			expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');
			expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
			expect(mockResponse.json).toHaveBeenCalledWith({ msg: msg.msg.logout });
		});
		it('debería lanzar error si el usuario no es encontrado', async () => {
			userService.findUserById.mockResolvedValue(null);
			await expect(
				service.logout({
					uid: 'user-uid',
					res: mockResponse as any,
					dataLog: 'test-log',
				}),
			).rejects.toThrow();
		});
	});
	describe('refreshToken', () => {
		const mockAudit = {
			uid: 'audit-uid',
			uidUser: 'user-uid',
			refreshToken: 'valid-refresh-token',
			update: vi.fn(),
		};
		it('debería actualizar token exitosamente', async () => {
			auditService.findOne.mockResolvedValue(mockAudit);
			userService.findUserById.mockResolvedValue(mockUser);
			jwtService.signAsync
				.mockResolvedValueOnce('new-access-token')
				.mockResolvedValueOnce('new-refresh-token');
			configService.get.mockReturnValue('development');
			await service.refreshToken({
				req: mockRequest as any,
				res: mockResponse as any,
				loginInfo: mockLoginInfo,
			});
			expect(auditService.findOne).toHaveBeenCalled();
			expect(userService.findUserById).toHaveBeenCalledWith('user-uid');
			expect(mockAudit.update).toHaveBeenCalledWith({
				refreshToken: 'new-refresh-token',
			});
			expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
			expect(mockResponse.json).toHaveBeenCalledWith({
				msg: 'Token actualizado',
			});
		});
		it('debería lanzar error si no hay token de actualización en cookies', async () => {
			const requestWithoutToken = { cookies: {} };
			await expect(
				service.refreshToken({
					req: requestWithoutToken as any,
					res: mockResponse as any,
					loginInfo: mockLoginInfo,
				}),
			).rejects.toThrow();
		});
		it('debería lanzar error si la auditoría no es encontrada', async () => {
			auditService.findOne.mockResolvedValue(null);
			await expect(
				service.refreshToken({
					req: mockRequest as any,
					res: mockResponse as any,
					loginInfo: mockLoginInfo,
				}),
			).rejects.toThrow();
		});
		it('debería cerrar sesión si los tokens de actualización no coinciden', async () => {
			const auditWithDifferentToken = {
				...mockAudit,
				refreshToken: 'different-token',
			};
			auditService.findOne.mockResolvedValue(auditWithDifferentToken);
			userService.findUserById.mockResolvedValue(mockUser);
			vi.spyOn(service, 'logout').mockResolvedValue();
			await service.refreshToken({
				req: mockRequest as any,
				res: mockResponse as any,
				loginInfo: mockLoginInfo,
			});
			expect(service.logout).toHaveBeenCalled();
		});
	});
	describe('setCookies', () => {
		it('debería establecer cookies para entorno de desarrollo', () => {
			configService.get.mockReturnValue('development');
			(service as any).setCookies(
				mockResponse,
				'access-token',
				'refresh-token',
			);
			expect(mockResponse.cookie).toHaveBeenCalledWith(
				'accessToken',
				'access-token',
				{
					httpOnly: true,
					secure: false,
					sameSite: 'lax',
					maxAge: 3600 * 1000,
				},
			);
			expect(mockResponse.cookie).toHaveBeenCalledWith(
				'refreshToken',
				'refresh-token',
				{
					httpOnly: true,
					secure: false,
					sameSite: 'lax',
					maxAge: 7 * 24 * 3600 * 1000,
				},
			);
		});
		it('debería establecer cookies para entorno de producción', () => {
			configService.get.mockReturnValue('production');
			(service as any).setCookies(
				mockResponse,
				'access-token',
				'refresh-token',
			);
			expect(mockResponse.cookie).toHaveBeenCalledWith(
				'accessToken',
				'access-token',
				{
					httpOnly: true,
					secure: true,
					sameSite: 'none',
					maxAge: 3600 * 1000,
				},
			);
		});
	});
	describe('generateAccessToken', () => {
		it('debería generar token de acceso con payload correcto', async () => {
			jwtService.signAsync.mockResolvedValue('access-token');
			process.env.JWT_SECRET = 'test-secret';
			const result = await (service as any).generateAccessToken(
				mockUser,
				mockLoginInfo,
			);
			expect(jwtService.signAsync).toHaveBeenCalledWith(
				{
					uid: mockUser.uid,
					uidRol: mockUser.uidRol,
					dataLog: `${mockUser.ci} - ${mockUser.first_surname} ${mockUser.first_name}`,
					...mockLoginInfo,
				},
				{
					expiresIn: '1h',
					secret: 'test-secret',
				},
			);
			expect(result).toBe('access-token');
		});
	});
	describe('generateRefreshToken', () => {
		it('debería generar token de actualización con payload correcto', async () => {
			jwtService.signAsync.mockResolvedValue('refresh-token');
			configService.get.mockReturnValue('refresh-secret');
			const result = await (service as any).generateRefreshToken(
				mockUser,
				mockLoginInfo,
			);
			expect(jwtService.signAsync).toHaveBeenCalledWith(
				{
					uid: mockUser.uid,
					...mockLoginInfo,
				},
				{
					expiresIn: '7d',
					secret: 'refresh-secret',
				},
			);
			expect(result).toBe('refresh-token');
		});
	});
});
