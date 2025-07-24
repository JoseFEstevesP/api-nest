import { Role } from '@/modules/security/rol/entities/rol.entity';
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';
import { Sex, V_E } from '../enum/data';
import { UserTypes } from '../types';

@Table
export class User extends Model<User> implements UserTypes {
	@Column({ primaryKey: true, unique: true, type: DataType.UUID() })
	declare uid: string;

	@Column({ allowNull: false, type: DataType.ENUM(V_E.e, V_E.v) })
	declare v_e: V_E;

	@Column({ unique: true })
	declare ci: string;

	@Column({ allowNull: false })
	declare first_name: string;

	@Column({ allowNull: false })
	declare middle_name: string;

	@Column({ allowNull: false })
	declare first_surname: string;

	@Column({ allowNull: false })
	declare last_surname: string;

	@Column({ allowNull: false, type: DataType.ENUM(Sex.m, Sex.f) })
	declare sex: Sex;

	@Column({ allowNull: false })
	declare phone: string;

	@Column({ allowNull: false })
	declare email: string;

	@Column({ allowNull: false })
	declare password: string;

	@Column({ defaultValue: true, allowNull: false })
	declare status: boolean;

	@Column
	declare code: string;

	@Column({ defaultValue: false, allowNull: false })
	declare activatedAccount: boolean;

	@Column({ defaultValue: 0, allowNull: false })
	declare attemptCount: number;

	@Column({ defaultValue: null })
	declare dataOfAttempt: string;

	@ForeignKey(() => Role)
	@Column({ allowNull: false, type: DataType.UUID })
	declare uidRol: string;

	@BelongsTo(() => Role)
	rol: Role;
}
