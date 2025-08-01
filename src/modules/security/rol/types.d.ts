import { Permission } from './enum/permissions';
import { TypeRol } from './enum/rolData';
import { Order } from '@/constants/dataConstants';
import { PaginationResult } from '@/types';
import { RolGetAllDTO } from './dto/rolGetAll.dto';
import { RolRegisterDTO } from './dto/rolRegister.dto';
import { RolUpdateDTO } from './dto/rolUpdate.dto';
import { Role } from './entities/rol.entity';
import { OrderRolProperty } from './enum/orderProperty';
import { msg } from './msg';

export interface RolTypes {
	uid: string;
	name: string;
	permissions: string[];
	typeRol: TypeRol;
	status: boolean;
}

export type DataRolOfStatus = Omit<RolTypes, 'status'>;

export interface ValidateRol<T> {
	models: { isRolByUid?: T; isRolByName?: T };
	msg: Msg;
}
export interface Msg {
	findOne: string;
	register: string;
	validation: {
		disability: string;
		default: string;
	};
	update: string;
	delete: string;
}

export interface RolDefault {
	name: string;
	description: string;
	permissions: Permission[];
	typeRol: TypeRol;
}

export interface IRolService {
	create(params: {
		data: RolRegisterDTO;
		dataLog: string;
	}): Promise<{ msg: string }>;

	findOne(where: WhereOptions<Role>, dataLog?: string): Promise<Role>;

	findPer(params: {
		uid: string;
		dataLog: string;
	}): Promise<Pick<Role, 'permissions' | 'name' | 'typeRol'>>;

	findAllPagination(params: {
		filter: RolGetAllDTO;
		dataLog: string;
	}): Promise<PaginationResult<Role>>;

	findAll(params: {
		dataLog: string;
	}): Promise<Array<{ value: string; label: string }>>;

	update(params: {
		data: RolUpdateDTO;
		dataLog: string;
	}): Promise<{ msg: string }>;

	remove(params: { uid: string; dataLog: string }): Promise<{ msg: string }>;
}

// Tipos auxiliares
type WhereOptions<T> = {
	[key in keyof T]?: any;
} & {
	[Op.or]?: Array<WhereOptions<T>>;
	[Op.and]?: Array<WhereOptions<T>>;
	[Op.iLike]?: string;
	[Op.overlap]?: any;
};

declare const Op: {
	or: symbol;
	and: symbol;
	iLike: symbol;
	overlap: symbol;
};
