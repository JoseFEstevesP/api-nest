import { User } from '@/user/entities/user.entity';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { TypeRol } from '../enum/rolData';
import { RolTypes } from '../types';

@Table({ tableName: 'Roles' })
export class Role extends Model<Role> implements RolTypes {
	@Column({ primaryKey: true, unique: true, type: DataType.UUID() })
	declare uid: string;

	@Column({ allowNull: false })
	declare name: string;

	@Column({ allowNull: false })
	declare description: string;

	@Column({ allowNull: false })
	declare typeRol: TypeRol;

	@Column({ allowNull: false, type: DataType.ARRAY(DataType.TEXT) })
	declare permissions: string[];

	@Column({ defaultValue: true, allowNull: false })
	declare status: boolean;

	@HasMany(() => User)
	user: User;
}
