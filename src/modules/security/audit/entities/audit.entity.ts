import { User } from '@/modules/security/user/entities/user.entity';
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';

@Table({ tableName: 'Audit' })
export class Audit extends Model<Audit> {
	@Column({ primaryKey: true, unique: true, type: DataType.UUID })
	declare uid: string;

	@ForeignKey(() => User)
	@Column({ allowNull: false, type: DataType.UUID })
	declare uidUser: string;

	@BelongsTo(() => User)
	user: User;

	@Column({ allowNull: false, type: DataType.TEXT })
	declare refreshToken: string;

	@Column({ allowNull: false, type: DataType.ARRAY(DataType.STRING) })
	declare dataToken: string[];
}
