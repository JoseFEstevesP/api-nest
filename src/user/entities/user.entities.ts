import { BelongsTo, Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Info } from 'src/info/entities/info.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { DataUser } from '../user';

@Table
export class User extends Model<User> implements DataUser {
  @Column({ primaryKey: true, unique: true })
  uid: string;

  @Column({ unique: true })
  ci: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  surname: string;

  @Column({ allowNull: false })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @Column({ defaultValue: true, allowNull: false })
  status: boolean;

  @BelongsTo(() => Rol, { foreignKey: 'uidRol', targetKey: 'uid' })
  rol: Rol;
  @Column({ defaultValue: true, allowNull: false })
  uidRol: string;

  @HasMany(() => Info, { foreignKey: 'uidUser', sourceKey: 'uid' })
  info: Info;
}
