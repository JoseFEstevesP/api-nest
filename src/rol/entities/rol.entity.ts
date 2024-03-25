import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { User } from 'src/user/entities/user.entities';
import { DataRol } from '../rol';

@Table
export class Rol extends Model<Rol> implements DataRol {
  @Column({ primaryKey: true, unique: true })
  uid: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false, type: DataType.TEXT })
  permissions: string;

  @Column({ defaultValue: true, allowNull: false })
  status: boolean;

  @HasMany(() => User, { foreignKey: 'uidRol', sourceKey: 'uid' })
  users: User;
}
