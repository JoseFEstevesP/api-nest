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

@Table
export class User extends Model<User> {
	@Column({ primaryKey: true, unique: true, type: DataType.UUID })
	declare uid: string;

	@Column({ allowNull: false, type: DataType.ENUM(V_E.e, V_E.v) })
	declare v_e: V_E;

	

	@Column({ allowNull: false, type: DataType.STRING })
	declare first_name: string;

	@Column({ allowNull: false, type: DataType.STRING })
	declare middle_name: string;

	@Column({ allowNull: false, type: DataType.STRING })
	declare first_surname: string;

	@Column({ allowNull: false, type: DataType.STRING })
	declare last_surname: string;

	@Column({ allowNull: false, type: DataType.ENUM(Sex.m, Sex.f) })
	declare sex: Sex;

	@Column({ allowNull: false, type: DataType.STRING })
	declare phone: string;

	@Column({ allowNull: false, type: DataType.STRING })
	declare email: string;

	@Column({ allowNull: false, type: DataType.STRING })
	declare password: string;

	@Column({ defaultValue: true, allowNull: false, type: DataType.BOOLEAN })
	declare status: boolean;

	@Column({ type: DataType.STRING })
	declare code: string;

	@Column({ defaultValue: false, allowNull: false, type: DataType.BOOLEAN })
	declare activatedAccount: boolean;

	@Column({ defaultValue: 0, allowNull: false, type: DataType.INTEGER })
	declare attemptCount: number;

	@Column({ defaultValue: null, type: DataType.STRING })
	declare dataOfAttempt: string;

	@ForeignKey(() => Role)
	@Column({ allowNull: false, type: DataType.UUID })
	declare uidRol: string;

	@BelongsTo(() => Role)
	declare rol: Role;
}
