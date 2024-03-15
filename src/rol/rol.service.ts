import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Order } from 'src/constants/order';
import { Rol } from './entities/rol.entity';
import { OrderRolProperty } from './enum/orderProperty';
import { validateRol } from './functions/validateRol';
import { DataRol, DataRolOfStatus, GetRol, ResListRol, ResRol } from './rol';
import { rolMsg } from './rol.msg';

@Injectable()
export class RolService {
  constructor(
    @InjectModel(Rol) private readonly rolModel: typeof Rol,
    private jwtService: JwtService,
  ) {}
  async register({ data }: { data: DataRolOfStatus }) {
    const isRolByUid = await this.rolModel.findOne({
      where: { uid: data.uid },
    });
    const isRolByName = await this.rolModel.findOne({
      where: { name: data.name },
    });

    const val = await validateRol({
      models: { isRolByUid, isRolByName },
      msg: rolMsg,
    });

    if (val) throw new HttpException(val, 409);

    const rol = await this.rolModel.create(data);

    await rol.save();

    throw new HttpException({ msg: rolMsg.register }, 200);
  }

  async findOneRol({ uid }: { uid: string }): ResRol {
    const rol = await this.rolModel.findOne({
      where: { uid, status: true },
      attributes: {
        exclude: ['status', 'createdAt', 'updatedAt'],
      },
    });

    if (!rol)
      throw new HttpException({ errors: [{ uid: rolMsg.findOne }] }, 409);

    throw new HttpException(rol, 200);
  }

  async findAllRol({
    status = true,
    limit,
    page,
    orderProperty = OrderRolProperty.name,
    order = Order.ASC,
    search,
    permission,
  }: GetRol) {
    const li = limit || 30;
    const pa = page || 1;
    const { rows, count } = await this.rolModel.findAndCountAll({
      where: {
        status,
        ...((search || permission) && {
          [Op.or]: [
            {
              ...(permission && {
                permissions: { [Op.iLike]: `%${permission}%` },
              }),
            },
            { ...(search && { name: { [Op.iLike]: `%${search}%` } }) },
          ],
        }),
      },
      attributes: {
        exclude: ['status', 'createdAt', 'updatedAt'],
      },
      limit: li || 30,
      offset: (pa - 1) * li,
      order: [[orderProperty, order]],
    });

    const pages = Math.ceil(count / li);
    const totalPage = pa > pages ? pages : pa;
    const nextPage = totalPage + 1;
    const previousPage = totalPage - 1;

    return { rows, count, pages, totalPage, nextPage, previousPage, li };
  }

  async findAll({
    status,
    limit,
    page,
    orderProperty,
    order,
    permission,
  }: GetRol): ResListRol {
    const { rows, count, pages, totalPage, nextPage, previousPage, li } =
      await this.findAllRol({
        status,
        limit,
        page,
        orderProperty,
        order,
        permission,
      });

    throw new HttpException(
      {
        rows,
        count,
        currentPage: totalPage,
        nextPage: nextPage <= pages ? nextPage : null,
        previousPage: previousPage > 0 ? previousPage : null,
        limit: li,
        pages,
      },
      200,
    );
  }

  async findSearch({
    status,
    limit,
    page,
    orderProperty,
    order,
    search,
    permission,
  }: GetRol): ResListRol {
    const { rows, count, pages, totalPage, nextPage, previousPage, li } =
      await this.findAllRol({
        status,
        limit,
        page,
        orderProperty,
        order,
        search,
        permission,
      });

    throw new HttpException(
      {
        rows,
        count,
        currentPage: totalPage,
        nextPage: nextPage <= pages ? nextPage : null,
        previousPage: previousPage > 0 ? previousPage : null,
        limit: li,
        pages,
      },
      200,
    );
  }

  async update({ data }: { data: DataRol }): ResRol {
    const { uid, status, name, permissions } = data;
    const rol = await this.rolModel.findOne({
      where: { uid },
    });
    if (!rol)
      throw new HttpException({ errors: [{ uid: rolMsg.findOne }] }, 409);
    await rol.update({
      name,
      permissions,
      ...((status === true || status === false) && { status: !status }),
    });

    throw new HttpException({ msg: rolMsg.update }, 200);
  }

  async deleteRol({ uid }: { uid: string }): ResRol {
    const rol = this.rolModel.findOne({ where: { uid, status: true } });

    if (!rol)
      throw new HttpException({ errors: [{ uid: rolMsg.findOne }] }, 409);

    (await rol).update({ status: false });
    throw new HttpException({ msg: rolMsg.delete }, 200);
  }
}
