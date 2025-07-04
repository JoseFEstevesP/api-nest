import { Sex, V_E } from './enum/data';

export interface DataUser {
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

export type DataOptional = Partial<DataUser>;
export type DataUserOfExtraData = Omit<
	DataUser,
	'status' | 'attemptCount' | 'code' | 'activatedAccount' | 'uidRol'
>;
export type DataUserGetAll = Omit<
	DataUser,
	'status' | 'password' | 'attemptCount'
>;
export type DataUserUpdate = Omit<
	DataUser,
	'password' | 'attemptCount' | 'uidRol' | 'activatedAccount' | 'code'
>;
export type DataUserUpdateProfile = Omit<
	DataUser,
	| 'password'
	| 'email'
	| 'uid'
	| 'status'
	| 'attemptCount'
	| 'uidRol'
	| 'activatedAccount'
	| 'code'
>;
export type DataUserUpdateProfileEmail = Pick<DataUser, 'password' | 'email'>;
export type DataUserLogin = Pick<DataUser, 'ci' | 'password'>;
export type DataUserUID = Pick<DataUser, 'uid'>;

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

export interface ValidateUser<T> {
	models: { isUserByUid?: T; isUserByCI?: T; isUserByEmail?: T };
	msg: Msg;
}

export interface UserJWT {
	user: { uid: string };
}

export interface Filter<T> {
	filter: T;
	uid: string;
}
