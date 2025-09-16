import { User } from '@/modules/security/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
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
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único de la auditoria',
	})
	@Column({
		primaryKey: true,
		unique: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	declare uid: string;

	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del usuario',
	})
	@ForeignKey(() => User)
	@Column({ allowNull: false, type: DataType.UUID })
	declare uidUser: string;

	@BelongsTo(() => User)
	user: User;

	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
		description: 'Token de refresco',
	})
	@Column({ allowNull: false, type: DataType.TEXT })
	declare refreshToken: string;

	@ApiProperty({
		example: ['data1', 'data2'],
		description: 'Datos del token',
	})
	@Column({ allowNull: false, type: DataType.ARRAY(DataType.STRING) })
	declare dataToken: string[];
}
