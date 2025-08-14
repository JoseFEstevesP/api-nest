import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { TypeRol } from '../enum/rolData';

@Table({ tableName: 'Roles' })
export class Role extends Model<Role> {
	@Column({ primaryKey: true, unique: true, type: DataType.UUID })
	declare uid: string;

	@Column({ allowNull: false, type: DataType.STRING })
	declare name: string;

	@Column({ allowNull: false, type: DataType.STRING })
	declare description: string;

	@Column({ allowNull: false, type: DataType.ENUM(...Object.values(TypeRol)) })
	declare typeRol: TypeRol;

	@Column({ allowNull: false, type: DataType.ARRAY(DataType.TEXT) })
	declare permissions: string[];

	@Column({ defaultValue: true, allowNull: false, type: DataType.BOOLEAN })
	declare status: boolean;
}
