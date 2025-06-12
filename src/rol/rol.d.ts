import { Permission } from './enum/permissions';
import { TypeRol } from './enum/rolData';

export interface DataRol {
	uid: string;
	name: string;
	permissions: string[];
	typeRol: TypeRol;
	status: boolean;
}

export type DataRolOfStatus = Omit<DataRol, 'status'>;

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
