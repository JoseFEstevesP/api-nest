import { Order } from '@/constants/dataConstants';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditService } from './audit.service';
import { OrderAuditProperty } from './enum/orderProperty';
import { msg } from './msg';

describe('AuditService', () => {
	let service: AuditService;
	let auditModel: any;
	let cacheManager: any;
	const mockAudit = {
		uid: 'audit-uid',
		uidUser: 'user-uid',
		refreshToken: 'refresh-token',
		dataToken: ['127.0.0.1', 'test-agent'],
		ip: '127.0.0.1',
		userAgent: 'test-agent',
		userPlatform: 'test-platform',
		createdAt: new Date(),
		user: {
			ci: '12345678',
			first_name: 'John',
			first_surname: 'Doe',
		},
		update: vi.fn(),
		destroy: vi.fn(),
	};

	beforeEach(() => {
		auditModel = {
			findOne: vi.fn(),
			findAndCountAll: vi.fn(),
			create: vi.fn(),
			destroy: vi.fn(),
		};
		cacheManager = {
			set: vi.fn(),
			del: vi.fn(),
		};
		service = new AuditService(auditModel, cacheManager);
		vi.clearAllMocks();
	});

	describe('create', () => {
		const createData = {
			uid: 'audit-uid',
			uidUser: 'user-uid',
			refreshToken: 'refresh-token',
			dataToken: ['127.0.0.1', 'test-agent'],
		};

		it('debería crear auditoría exitosamente', async () => {
			auditModel.findOne.mockResolvedValue(null);
			auditModel.create.mockResolvedValue(mockAudit);
			const result = await service.create({ data: createData });
			expect(auditModel.findOne).toHaveBeenCalledWith({
				where: {
					uidUser: createData.uidUser,
					dataToken: createData.dataToken,
				},
			});
			expect(auditModel.create).toHaveBeenCalledWith(createData);
			expect(result).toBe(mockAudit);
		});

		it('debería lanzar error si la auditoría ya existe', async () => {
			auditModel.findOne.mockResolvedValue(mockAudit);
			await expect(service.create({ data: createData })).rejects.toThrow();
		});
	});

	describe('findOne', () => {
		it('debería encontrar auditoría por cláusula where', async () => {
			const whereClause = { uid: 'audit-uid' };
			auditModel.findOne.mockResolvedValue(mockAudit);
			const result = await service.findOne(whereClause);
			expect(auditModel.findOne).toHaveBeenCalledWith({ where: whereClause });
			expect(result).toBe(mockAudit);
		});
	});

	describe('findAll', () => {
		const filter = {
			limit: '10',
			page: '1',
			search: 'John',
			orderProperty: OrderAuditProperty.ci,
			order: Order.ASC,
		};

		it('debería retornar auditorías paginadas', async () => {
			auditModel.findAndCountAll.mockResolvedValue({
				rows: [mockAudit],
				count: 1,
			});
			const result = await service.findAll({
				filter,
				uidUser: 'current-user',
				dataLog: 'test-log',
			});
			expect(auditModel.findAndCountAll).toHaveBeenCalled();
			expect(result.rows).toEqual([mockAudit]);
			expect(result.count).toBe(1);
			expect(result.currentPage).toBe(1);
		});
	});

	describe('remove', () => {
		const whereClause = { uidUser: 'user-uid' };

		it('debería eliminar auditoría exitosamente', async () => {
			auditModel.findOne.mockResolvedValue(mockAudit);
			const result = await service.remove(whereClause, 'test-log');
			expect(auditModel.findOne).toHaveBeenCalledWith({ where: whereClause });
			expect(mockAudit.destroy).toHaveBeenCalled();
			expect(result).toEqual({ msg: msg.msg.remove });
		});

		it('debería lanzar error si no se encuentra la auditoría', async () => {
			auditModel.findOne.mockResolvedValue(null);
			await expect(service.remove(whereClause, 'test-log')).rejects.toThrow();
		});

		it('debería lanzar error si falla la eliminación', async () => {
			auditModel.findOne.mockResolvedValue(mockAudit);
			mockAudit.destroy.mockRejectedValue(new Error('Destroy error'));
			await expect(service.remove(whereClause, 'test-log')).rejects.toThrow();
		});
	});

	describe('update', () => {
		const updateData = {
			uid: 'audit-uid',
			refreshToken: 'new-refresh-token',
		};

		it('debería actualizar auditoría exitosamente', async () => {
			auditModel.findOne.mockResolvedValue(mockAudit);
			const result = await service.update({ data: updateData });
			expect(auditModel.findOne).toHaveBeenCalledWith({
				where: { uid: updateData.uid },
			});
			expect(mockAudit.update).toHaveBeenCalledWith({
				refreshToken: updateData.refreshToken,
			});
			expect(result).toEqual({ msg: msg.msg.update });
		});

		it('debería lanzar error si no se encuentra la auditoría', async () => {
			auditModel.findOne.mockResolvedValue(null);
			await expect(service.update({ data: updateData })).rejects.toThrow();
		});
	});

	describe('buildWhereClause', () => {
		it('debería construir cláusula where sin búsqueda', () => {
			const result = (service as any).buildWhereClause('user-uid');
			expect(result).toHaveProperty('uid');
			const symbols = Object.getOwnPropertySymbols(result.uid);
			expect(symbols.length).toBeGreaterThan(0);
			const value = result.uid[symbols[0]];
			expect(value).toBe('user-uid');
		});

		it('debería construir cláusula where con búsqueda', () => {
			const result = (service as any).buildWhereClause('user-uid', 'John');
			expect(result).toHaveProperty('uid');
			const symbols = Object.getOwnPropertySymbols(result.uid);
			expect(symbols.length).toBeGreaterThan(0);
			const value = result.uid[symbols[0]];
			expect(value).toBe('user-uid');
		});
	});

	describe('calculatePagination', () => {
		it('debería calcular paginación correctamente', () => {
			const result = (service as any).calculatePagination(25, 10, 2);
			expect(result).toEqual({
				currentPage: 2,
				nextPage: 3,
				previousPage: 1,
				limit: 10,
				pages: 3,
			});
		});

		it('debería manejar última página correctamente', () => {
			const result = (service as any).calculatePagination(25, 10, 3);
			expect(result).toEqual({
				currentPage: 3,
				nextPage: null,
				previousPage: 2,
				limit: 10,
				pages: 3,
			});
		});

		it('debería manejar primera página correctamente', () => {
			const result = (service as any).calculatePagination(25, 10, 1);
			expect(result).toEqual({
				currentPage: 1,
				nextPage: 2,
				previousPage: null,
				limit: 10,
				pages: 3,
			});
		});
	});

	describe('acquireLock', () => {
		it('debería adquirir bloqueo exitosamente', async () => {
			cacheManager.set.mockResolvedValue(true);
			const result = await (service as any).acquireLock();
			expect(cacheManager.set).toHaveBeenCalledWith(
				'audit_cleanup_lock',
				true,
				60000,
			);
			expect(result).toBe(true);
		});

		it('debería fallar al adquirir bloqueo', async () => {
			cacheManager.set.mockResolvedValue(false);
			const result = await (service as any).acquireLock();
			expect(result).toBe(false);
		});
	});

	describe('releaseLock', () => {
		it('debería liberar bloqueo exitosamente', async () => {
			cacheManager.del.mockResolvedValue(true);
			await (service as any).releaseLock();
			expect(cacheManager.del).toHaveBeenCalledWith('audit_cleanup_lock');
		});

		it('debería manejar error al liberar bloqueo', async () => {
			cacheManager.del.mockRejectedValue(new Error('Cache error'));
			await expect((service as any).releaseLock()).resolves.not.toThrow();
		});
	});

	describe('removeOldAudits', () => {
		it('debería eliminar auditorías antiguas exitosamente', async () => {
			auditModel.destroy.mockResolvedValue(5);
			vi.spyOn(service as any, 'releaseLock').mockImplementation(() =>
				Promise.resolve(),
			);
			await (service as any).removeOldAudits();
			expect(auditModel.destroy).toHaveBeenCalled();
			const callArgs = auditModel.destroy.mock.calls[0][0];
			expect(callArgs.where.createdAt).toBeDefined();
			const symbols = Object.getOwnPropertySymbols(callArgs.where.createdAt);
			expect(symbols.length).toBeGreaterThan(0);
			const value = callArgs.where.createdAt[symbols[0]];
			expect(value).toBeInstanceOf(Date);
			expect((service as any).releaseLock).toHaveBeenCalled();
		});

		it('debería manejar error y aún liberar bloqueo', async () => {
			auditModel.destroy.mockRejectedValue(new Error('Database error'));
			vi.spyOn(service as any, 'releaseLock').mockImplementation(() =>
				Promise.resolve(),
			);
			await (service as any).removeOldAudits();
			expect((service as any).releaseLock).toHaveBeenCalled();
		});
	});

	describe('cleanUpOldAuditsScheduled', () => {
		it('debería ejecutar limpieza cuando se adquiere bloqueo', async () => {
			vi.spyOn(service as any, 'acquireLock').mockResolvedValue(true);
			vi.spyOn(service as any, 'removeOldAudits').mockImplementation(() =>
				Promise.resolve(),
			);
			await service.cleanUpOldAuditsScheduled();
			expect((service as any).acquireLock).toHaveBeenCalled();
			expect((service as any).removeOldAudits).toHaveBeenCalled();
		});

		it('debería omitir limpieza cuando no se adquiere bloqueo', async () => {
			vi.spyOn(service as any, 'acquireLock').mockResolvedValue(false);
			vi.spyOn(service as any, 'removeOldAudits').mockImplementation(() =>
				Promise.resolve(),
			);
			await service.cleanUpOldAuditsScheduled();
			expect((service as any).acquireLock).toHaveBeenCalled();
			expect((service as any).removeOldAudits).not.toHaveBeenCalled();
		});
	});

	describe('getOrder', () => {
		it('debería retornar orden correcto para ci', () => {
			const result = (service as any).getOrder(
				OrderAuditProperty.ci,
				Order.ASC,
			);
			expect(result).toEqual([['user', 'ci', Order.ASC]]);
		});

		it('debería retornar orden correcto para ip', () => {
			const result = (service as any).getOrder(
				OrderAuditProperty.ip,
				Order.DESC,
			);
			expect(result).toEqual([['ip', Order.DESC]]);
		});
	});
});
