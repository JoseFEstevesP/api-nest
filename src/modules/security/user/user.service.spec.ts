import { Order } from '@/constants/dataConstants';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { TypeRol } from '@/modules/security/rol/enum/rolData';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderUserProperty, Sex, V_E } from './enum/data';
import { msg } from './msg';
import { UserService } from './user.service';
describe('UserService', () => {
	let service: UserService;
	let userModel: any;
	let rolService: any;
	let emailService: any;
	let jwtService: any;
	let auditService: any;
	let configService: any;
	let cacheManager: any;
	const mockUser = {
		uid: 'test-uid',
		v_e: V_E.v,
		ci: '12345678',
		first_name: 'John',
		middle_name: 'Middle',
		first_surname: 'Doe',
		last_surname: 'Last',
		sex: Sex.m,
		phone: '+584121234567',
		email: 'test@example.com',
		password: 'hashedPassword',
		status: true,
		code: null,
		activatedAccount: true,
		attemptCount: 0,
		uidRol: 'role-uid',
		rol: {
			name: 'User',
			permissions: [Permission.audit],
			typeRol: TypeRol.user,
		},
		update: vi.fn(),
		destroy: vi.fn(),
	};
	beforeEach(() => {
		userModel = {
			findOne: vi.fn(),
			findAndCountAll: vi.fn(),
			create: vi.fn(),
		};
		rolService = {
			findOne: vi.fn(),
		};
		emailService = {
			activatedAccount: vi.fn(),
			recoveryPassword: vi.fn(),
		};
		jwtService = {
			signAsync: vi.fn(),
		};
		auditService = {
			remove: vi.fn(),
		};
		configService = {
			get: vi.fn(),
		};
		cacheManager = {
			get: vi.fn(),
			set: vi.fn(),
		};
		service = new UserService(
			userModel,
			rolService,
			emailService,
			jwtService,
			auditService,
			configService,
			cacheManager,
		);
	});
	describe('create', () => {
		const createData = {
			uid: 'test-uid',
			v_e: V_E.v,
			ci: '12345678',
			first_name: 'John',
			middle_name: 'Middle',
			first_surname: 'Doe',
			last_surname: 'Last',
			sex: Sex.m,
			phone: '+584121234567',
			email: 'test@example.com',
			password: 'Password123!',
		};
		it('debería crear usuario exitosamente', async () => {
			userModel.findOne.mockResolvedValue(null);
			rolService.findOne.mockResolvedValue({ uid: 'role-uid' });
			configService.get.mockReturnValue('user');
			vi.spyOn(await import('bcrypt'), 'hash').mockResolvedValue(
				'hashedPassword' as never,
			);
			vi.spyOn(service as any, 'generateCode').mockReturnValue(123456);
			const result = await service.create({ data: createData });
			expect(userModel.create).toHaveBeenCalled();
			expect(result).toEqual({ msg: msg.msg.registerDefault });
		});
		it('debería lanzar error si el usuario ya existe', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			await expect(service.create({ data: createData })).rejects.toThrow();
		});
	});
	describe('createProtect', () => {
		const createData = {
			uid: 'test-uid',
			v_e: V_E.v,
			ci: '12345678',
			first_name: 'John',
			middle_name: 'Middle',
			first_surname: 'Doe',
			last_surname: 'Last',
			sex: Sex.m,
			phone: '+584121234567',
			email: 'test@example.com',
			password: 'Password123!',
			uidRol: 'role-uid',
		};
		it('debería crear usuario protegido exitosamente', async () => {
			userModel.findOne.mockResolvedValue(null);
			vi.spyOn(await import('bcrypt'), 'hash').mockResolvedValue(
				'hashedPassword' as never,
			);
			const result = await service.createProtect({
				data: createData,
				dataLog: 'test-log',
			});
			expect(userModel.create).toHaveBeenCalledWith({
				...createData,
				password: 'hashedPassword',
				activatedAccount: true,
				code: null,
			});
			expect(result).toEqual({ msg: msg.msg.registerAdmin });
		});
	});
	describe('profile', () => {
		it('debería devolver el perfil de usuario exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.profile({
				uid: 'test-uid',
				dataLog: 'test-log',
			});
			expect(result).toBe(mockUser);
		});
		it('debería lanzar error si el usuario no es encontrado', async () => {
			userModel.findOne.mockResolvedValue(null);
			await expect(
				service.profile({
					uid: 'test-uid',
					dataLog: 'test-log',
				}),
			).rejects.toThrow();
		});
	});
	describe('findOne', () => {
		it('debería encontrar usuario administrador exitosamente', async () => {
			const adminUser = {
				...mockUser,
				rol: { ...mockUser.rol, typeRol: TypeRol.admin },
			};
			userModel.findOne.mockResolvedValue(adminUser);
			const result = await service.findOne({ uid: 'test-uid' }, 'test-log');
			expect(result).toBe(adminUser);
		});
		it('debería lanzar error si el usuario no es administrador', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			await expect(
				service.findOne({ uid: 'test-uid' }, 'test-log'),
			).rejects.toThrow();
		});
	});
	describe('findAll', () => {
		const filter = {
			limit: '10',
			page: '1',
			search: 'John',
			status: 'true',
			orderProperty: OrderUserProperty.ci,
			order: Order.ASC,
		};
		it('debería devolver usuarios paginados desde caché', async () => {
			const cachedResult = {
				rows: [mockUser],
				count: 1,
				currentPage: 1,
				totalPages: 1,
			};
			cacheManager.get.mockResolvedValue(cachedResult);
			const result = await service.findAll({
				filter,
				uidUser: 'current-user',
				dataLog: 'test-log',
			});
			expect(result).toBe(cachedResult);
		});
		it('debería devolver usuarios paginados desde la base de datos', async () => {
			cacheManager.get.mockResolvedValue(null);
			userModel.findAndCountAll.mockResolvedValue({
				rows: [mockUser],
				count: 1,
			});
			const result = await service.findAll({
				filter,
				uidUser: 'current-user',
				dataLog: 'test-log',
			});
			expect(userModel.findAndCountAll).toHaveBeenCalled();
			expect(result.rows).toEqual([mockUser]);
		});
	});
	describe('update', () => {
		const updateData = {
			uid: 'test-uid',
			first_name: 'Updated Name',
			ci: '12345678',
			email: 'test@gmail.com',
			first_surname: 'surname',
			last_surname: 'lastname',
			middle_name: 'middle',
			phone: '04140000000',
			sex: Sex.m,
			v_e: V_E.e,
			uidRol: 'role-uid',
			status: true,
		};
		it('debería actualizar usuario exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.update({
				data: updateData,
				dataLog: 'test-log',
			});
			expect(mockUser.update).toHaveBeenCalled();
			expect(result).toEqual({ msg: msg.msg.update });
		});
		it('debería lanzar error si el usuario no es encontrado', async () => {
			userModel.findOne.mockResolvedValue(null);
			await expect(
				service.update({
					data: updateData,
					dataLog: 'test-log',
				}),
			).rejects.toThrow();
		});
	});
	describe('updateProfile', () => {
		const updateData = {
			first_name: 'Updated Name',
			middle_name: 'middle',
			first_surname: 'surname',
			last_surname: 'lastname',
			phone: '04140000000',
			ci: '12345678',
			sex: Sex.f,
			v_e: V_E.e,
		};
		it('debería actualizar perfil de usuario exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.updateProfile({
				data: updateData,
				uid: 'test-uid',
				dataLog: 'test-log',
			});
			expect(mockUser.update).toHaveBeenCalledWith(updateData);
			expect(result).toEqual({ msg: msg.msg.update });
		});
	});
	describe('updateProfileEmail', () => {
		const updateData = {
			email: 'new@example.com',
			password: 'Password123!',
		};
		it('debería actualizar email de usuario exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			vi.spyOn(await import('bcrypt'), 'compare').mockResolvedValue(
				true as never,
			);
			const result = await service.updateProfileEmail({
				data: updateData,
				uid: 'test-uid',
				dataLog: 'test-log',
			});
			expect(mockUser.update).toHaveBeenCalledWith({
				email: 'new@example.com',
			});
			expect(result).toEqual({ msg: msg.msg.update });
		});
		it('debería lanzar error si la contraseña es incorrecta', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			vi.spyOn(await import('bcrypt'), 'compare').mockResolvedValue(
				false as never,
			);
			await expect(
				service.updateProfileEmail({
					data: updateData,
					uid: 'test-uid',
					dataLog: 'test-log',
				}),
			).rejects.toThrow();
		});
	});
	describe('updateProfilePassword', () => {
		const passwordData = {
			olPassword: 'OldPassword123!',
			newPassword: 'NewPassword123!',
		};
		it('debería actualizar contraseña exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			vi.spyOn(await import('bcrypt'), 'compare').mockResolvedValue(
				true as never,
			);
			vi.spyOn(await import('bcrypt'), 'hash').mockResolvedValue(
				'newHashedPassword' as never,
			);
			const result = await service.updateProfilePassword({
				data: passwordData,
				uid: 'test-uid',
				dataLog: 'test-log',
			});
			expect(mockUser.update).toHaveBeenCalledWith({
				password: 'newHashedPassword',
			});
			expect(auditService.remove).toHaveBeenCalled();
			expect(result).toEqual({ msg: msg.msg.update });
		});
	});
	describe('unregister', () => {
		it('debería dar de baja usuario exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.unregister({
				uid: 'test-uid',
				dataLog: 'test-log',
			});
			expect(mockUser.update).toHaveBeenCalledWith({ status: false });
			expect(result).toEqual({ msg: msg.msg.unregister });
		});
	});
	describe('remove', () => {
		it('debería eliminar usuario exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.remove({
				uid: 'test-uid',
				dataLog: 'test-log',
			});
			expect(mockUser.destroy).toHaveBeenCalled();
			expect(result).toEqual({ msg: msg.msg.unregister });
		});
	});
	describe('recoveryPassword', () => {
		it('debería enviar email de recuperación de contraseña', async () => {
			const userWithActiveAccount = { ...mockUser, activatedAccount: true };
			userModel.findOne.mockResolvedValue(userWithActiveAccount);
			vi.spyOn(service as any, 'generateCode').mockReturnValue(123456);
			const result = await service.recoveryPassword({
				email: 'test@example.com',
				dataLog: 'test-log',
			});
			expect(emailService.recoveryPassword).toHaveBeenCalled();
			expect(result).toEqual({ msg: msg.msg.recoveryPassword });
		});
		it('debería lanzar error si la cuenta no está activada', async () => {
			const userWithInactiveAccount = { ...mockUser, activatedAccount: false };
			userModel.findOne.mockResolvedValue(userWithInactiveAccount);
			await expect(
				service.recoveryPassword({
					email: 'test@example.com',
					dataLog: 'test-log',
				}),
			).rejects.toThrow();
		});
	});
	describe('recoveryVerifyPassword', () => {
		it('debería verificar código de recuperación y devolver token', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			jwtService.signAsync.mockResolvedValue('jwt-token');
			const result = await service.recoveryVerifyPassword({
				code: '123456',
				email: 'test@example.com',
				dataLog: 'test-log',
			});
			expect(mockUser.update).toHaveBeenCalledWith({ code: null });
			expect(result).toEqual({ token: 'jwt-token' });
		});
	});
	describe('newPassword', () => {
		it('debería establecer nueva contraseña exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			vi.spyOn(await import('bcrypt'), 'hash').mockResolvedValue(
				'newHashedPassword' as never,
			);
			const result = await service.newPassword({
				newPassword: 'NewPassword123!',
				confirmPassword: 'NewPassword123!',
				uidUser: 'test-uid',
				dataLog: 'test-log',
			});
			expect(mockUser.update).toHaveBeenCalledWith({
				password: 'newHashedPassword',
			});
			expect(result).toEqual({ msg: msg.msg.newPasswordChanged });
		});
		it('debería lanzar error si las contraseñas no coinciden', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			await expect(
				service.newPassword({
					newPassword: 'NewPassword123!',
					confirmPassword: 'DifferentPassword123!',
					uidUser: 'test-uid',
					dataLog: 'test-log',
				}),
			).rejects.toThrow();
		});
	});
	describe('activatedAccount', () => {
		const activateData = {
			code: '123456',
		};
		it('debería activar cuenta exitosamente', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.activatedAccount(activateData);
			expect(mockUser.update).toHaveBeenCalledWith({
				code: null,
				activatedAccount: true,
			});
			expect(result).toEqual({ msg: msg.msg.activationAccount });
		});
	});
	describe('findUserForAuth', () => {
		it('debería encontrar usuario para autenticación', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.findUserForAuth('12345678');
			expect(result).toBe(mockUser);
		});
	});
	describe('findUserById', () => {
		it('debería encontrar usuario por id', async () => {
			userModel.findOne.mockResolvedValue(mockUser);
			const result = await service.findUserById('test-uid');
			expect(result).toBe(mockUser);
		});
	});
	describe('validateAttempt', () => {
		it('debería incrementar contador de intentos', async () => {
			const userWithAttempts = {
				...mockUser,
				attemptCount: 1,
				update: vi.fn(),
			};
			await service.validateAttempt({ user: userWithAttempts as any });
			expect(userWithAttempts.update).toHaveBeenCalledWith({
				attemptCount: 2,
			});
		});
		it('debería bloquear usuario después de máximos intentos', async () => {
			const userWithMaxAttempts = {
				...mockUser,
				attemptCount: 4,
				update: vi.fn(),
			};
			await expect(
				service.validateAttempt({
					user: userWithMaxAttempts as any,
				}),
			).rejects.toThrow();
			expect(userWithMaxAttempts.update).toHaveBeenCalledWith({
				attemptCount: 4,
				status: false,
			});
		});
	});
	describe('formatCI', () => {
		it('debería formatear CI eliminando caracteres no numéricos', () => {
			const result = (service as any).formatCI('V-12.345.678');
			expect(result).toBe('12345678');
		});
	});
	describe('generateCode', () => {
		it('debería generar código de 7 dígitos', () => {
			const code = (service as any).generateCode();
			expect(code).toBeGreaterThanOrEqual(1000000);
			expect(code).toBeLessThanOrEqual(9999999);
		});
	});
});
