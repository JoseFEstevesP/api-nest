import { createMockRepository } from '@/test/mocks/database.mock';
import { mockCacheManager } from '@/test/utils/test-helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RolGetAllDTO } from './dto/rolGetAll.dto';
import { RolRegisterDTO } from './dto/rolRegister.dto';
import { RolUpdateDTO } from './dto/rolUpdate.dto';
import { Permission } from './enum/permissions';
import { TypeRol } from './enum/rolData';
import { RolService } from './rol.service';

describe('RolService', () => {
	let service: RolService;
	let roleRepository: ReturnType<typeof createMockRepository>;

	beforeEach(() => {
		roleRepository = createMockRepository();

		service = new RolService(
			roleRepository as any,
			{} as any,
			mockCacheManager,
		);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('debería estar definido', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('debería crear un rol exitosamente', async () => {
			const roleData: RolRegisterDTO = {
				uid: 'test-uid',
				name: 'admin',
				permissions: [Permission.audit],
				typeRol: TypeRol.admin,
				description: 'test description',
			};

			roleRepository.findOne.mockResolvedValue(null);
			roleRepository.create.mockResolvedValue(roleData);

			const result = await service.create({
				data: roleData,
				dataLog: 'test-log',
			});

			expect(roleRepository.findOne).toHaveBeenCalled();
			expect(roleRepository.create).toHaveBeenCalledWith(roleData);
			expect(result).toHaveProperty('msg');
		});
	});

	describe('findOne', () => {
		it('debería retornar un rol', async () => {
			const mockRole = { uid: 'test-uid', name: 'admin' };
			roleRepository.findOne.mockResolvedValue(mockRole);

			const result = await service.findOne({ uid: 'test-uid' }, 'test-log');

			expect(roleRepository.findOne).toHaveBeenCalledWith({
				where: { uid: 'test-uid', status: true },
				attributes: { exclude: ['status', 'createdAt', 'updatedAt'] },
			});
			expect(result).toEqual(mockRole);
		});
	});

	describe('findAllPagination', () => {
		it('debería retornar roles paginados', async () => {
			const filter: RolGetAllDTO = { limit: '10', page: '1' };
			const mockRoles = [{ uid: 'test-uid', name: 'admin' }];

			roleRepository.findAndCountAll.mockResolvedValue({
				rows: mockRoles,
				count: 1,
			});
			mockCacheManager.get.mockResolvedValue(null);

			const result = await service.findAllPagination({
				filter,
				dataLog: 'test-log',
			});

			expect(result).toHaveProperty('rows');
			expect(result).toHaveProperty('count');
		});
	});

	describe('update', () => {
		it('debería actualizar un rol exitosamente', async () => {
			const updateData: RolUpdateDTO = {
				uid: 'test-uid',
				name: 'updated-admin',
				typeRol: TypeRol.admin,
				description: 'updated description',
				permissions: [Permission.audit],
				status: false,
			};
			const mockRoleInstance = {
				update: vi.fn().mockResolvedValue(undefined),
			};

			roleRepository.findOne.mockResolvedValue(mockRoleInstance);

			const result = await service.update({
				data: updateData,
				dataLog: 'test-log',
			});

			expect(mockRoleInstance.update).toHaveBeenCalled();
			expect(result).toHaveProperty('msg');
		});
	});
});
