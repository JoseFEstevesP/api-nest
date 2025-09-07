import { IsObject } from 'class-validator';

export class ReqUidDTO {
	@IsObject({ message: 'El objeto no es valido' })
	user: {
		uid: string;
		uidRol: string;
		uidPharmacy: string | null;
		dataLog: string;
	};
}
