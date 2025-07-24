import { Sex, V_E } from './enum/data';

export interface UserTypes {
	uid: string;
	v_e: V_E;
	ci: string;
	first_name: string;
	middle_name: string;
	first_surname: string;
	last_surname: string;
	sex: Sex;
	phone: string;
	email: string;
	password: string;
	status: boolean;
	uidRol: string;
}

export type DataOptional = Partial<UserTypes>;
export type DataUserOfExtraData = Omit<
	UserTypes,
	'status' | 'attemptCount' | 'code' | 'activatedAccount' | 'uidRol'
>;
export type DataUserGetAll = Omit<
	UserTypes,
	'status' | 'password' | 'attemptCount'
>;
export type DataUserUpdate = Omit<
	UserTypes,
	'password' | 'attemptCount' | 'uidRol' | 'activatedAccount' | 'code'
>;
export type DataUserUpdateProfile = Omit<
	UserTypes,
	| 'password'
	| 'email'
	| 'uid'
	| 'status'
	| 'attemptCount'
	| 'uidRol'
	| 'activatedAccount'
	| 'code'
>;
export type DataUserUpdateProfileEmail = Pick<UserTypes, 'password' | 'email'>;
export type DataUserLogin = Pick<UserTypes, 'ci' | 'password'>;
export type DataUserUID = Pick<UserTypes, 'uid'>;

export interface Msg {
	findOne: string;
	register: string;
	validation: {
		disability: string;
		default: string;
	};
	login: {
		status: string;
		error: string;
	};
	update: string;
	profile: {
		data: string;
		email: string;
		password: string;
		passwordError: string;
		error: string;
	};
	unregister: string;
}
