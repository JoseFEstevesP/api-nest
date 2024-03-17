import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { compare, hash } from 'bcrypt';
import { Op } from 'sequelize';
import { Order } from 'src/constants/order';
import { ResData } from './../types';
import { OrderUserProperty } from './constant/orderProperty';
import { salt } from './constants/sal';
import { User } from './entities/user.entities';
import { validateUserLogin } from './functions/validateUserLogin';
import { validateUser } from './functions/validateUserRegister';
import {
  DataUserLogin,
  DataUserOfExtraData,
  DataUserUpdate,
  DataUserUpdateProfile,
  DataUserUpdateProfileEmail,
  Filter,
  GetUsers,
  ResListUser,
  ResUser,
  ReturnLoginUser,
} from './user';
import { userMsg } from './user.msg';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private jwtService: JwtService,
  ) {}

  async register({ data }: { data: DataUserOfExtraData }): ResData {
    const { uid, ci, email, password } = data;
    const isUserByUid = await this.userModel.findOne({
      where: { uid },
    });

    const isUserByCI = await this.userModel.findOne({ where: { ci: ci } });

    const isUserByEmail = await this.userModel.findOne({
      where: { email: email },
    });

    const val = await validateUser({
      models: { isUserByUid, isUserByCI, isUserByEmail },
      msg: userMsg,
    });

    if (val) throw new HttpException(val, 409);

    const hashPass = await hash(password, salt);

    const user = await this.userModel.create({
      ...data,
      password: hashPass,
    });

    await user.save();

    throw new HttpException({ msg: userMsg.register }, 200);
  }

  async login({ data }: { data: DataUserLogin }): ReturnLoginUser {
    const { ci, password } = data;
    const isUserByCI = await this.userModel.findOne({
      where: { ci },
    });

    const val = await validateUserLogin({
      models: { isUserByCI },
      msg: userMsg,
    });

    if (val) throw new HttpException(val, 409);

    const checkPassword = await compare(password, isUserByCI.password);
    if (!checkPassword)
      throw new HttpException({ errors: [{ uid: userMsg.login.error }] }, 403);

    const token = this.jwtService.sign({
      uid: isUserByCI.uid,
      uidRol: isUserByCI.uidRol,
    });

    throw new HttpException({ jwt: token }, 200);
  }

  async profile({
    uid,
    status = true,
  }: {
    uid: string;
    status?: boolean;
  }): ResUser {
    const user = await this.userModel.findOne({
      where: { uid, status },
      attributes: {
        exclude: ['password', 'status', 'createdAt', 'updatedAt'],
      },
    });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 403);

    return user;
  }

  async getOne({ uid }: { uid: string }): ResUser {
    const user = await this.userModel.findOne({
      where: { uid, status: true },
      attributes: {
        exclude: ['password', 'status', 'createdAt', 'updatedAt'],
      },
    });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    throw new HttpException(user, 200);
  }

  async get({
    status = true,
    limit,
    page,
    orderProperty = OrderUserProperty.name,
    order = Order.ASC,
    search,
  }: GetUsers) {
    const li = +limit || 30;
    const pa = +page || 1;
    const { rows, count } = await this.userModel.findAndCountAll({
      where: {
        status,
        ...(search && {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { ci: { [Op.iLike]: `%${search}%` } },
            { surname: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }),
      },
      attributes: {
        exclude: ['password', 'status', 'createdAt', 'updatedAt'],
      },
      limit: li,
      offset: (pa - 1) * li,
      order: [[orderProperty, order]],
    });

    const pages = Math.ceil(count / li);
    const totalPage = pa > pages ? pages : pa;
    const nextPage = totalPage + 1;
    const previousPage = totalPage - 1;

    return { rows, count, pages, totalPage, nextPage, previousPage, li };
  }

  async getData({ filter, uid }: Filter<GetUsers>): ResListUser {
    const { status, limit, page, orderProperty, order, search } = filter;
    const { rows, count, pages, totalPage, nextPage, previousPage, li } =
      await this.get({ status, limit, page, orderProperty, order, search });

    const data: Array<User> = rows.filter((item) => item.uid !== uid);

    throw new HttpException(
      {
        rows: data,
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

  async update({ data }: { data: DataUserUpdate }): ResData {
    const { uid, status, ci, name, surname, email } = data;
    const user = await this.userModel.findOne({
      where: { uid },
    });
    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);
    await user.update({
      ci,
      name,
      surname,
      email,
      ...((status === true || status === false) && { status: !status }),
    });

    throw new HttpException({ msg: userMsg.update }, 200);
  }

  async updateProfile({
    data,
    uid,
  }: {
    data: DataUserUpdateProfile;
    uid: string;
  }): ResData {
    const user = await this.userModel.findOne({ where: { uid } });
    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);
    const { ci, name, surname } = data;
    await user.update({ ci, name, surname });
    throw new HttpException({ msg: userMsg.update }, 200);
  }

  async updateProfileEmail({
    data,
    uid,
  }: {
    data: DataUserUpdateProfileEmail;
    uid: string;
  }): ResData {
    const { email, password } = data;
    const user = await this.userModel.findOne({ where: { uid } });
    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    const checkPassword = await compare(password, user.password);
    if (!checkPassword)
      throw new HttpException(
        { errors: [{ uid: userMsg.profile.passwordError }] },
        403,
      );

    await user.update({ email });
    throw new HttpException({ msg: userMsg.update }, 200);
  }

  async updateProfilePassword({
    data,
    uid,
  }: {
    data: { olPassword: string; newPassword: string };
    uid: string;
  }): ResData {
    const { olPassword, newPassword } = data;
    const user = await this.userModel.findOne({ where: { uid } });
    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    const checkPassword = await compare(olPassword, user.password);
    if (!checkPassword)
      throw new HttpException(
        { errors: [{ uid: userMsg.profile.passwordError }] },
        403,
      );

    const hashPass = await hash(newPassword, salt);

    await user.update({ password: hashPass });
    throw new HttpException({ msg: userMsg.update }, 200);
  }

  async unregister({ uid }: { uid: string }): ResData {
    const user = this.userModel.findOne({ where: { uid } });

    if (!user) {
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);
    }

    (await user).update({ status: false });
    throw new HttpException({ msg: userMsg.unregister }, 200);
  }

  async deleteItem({ uid }: { uid: string }): ResData {
    const user = this.userModel.findOne({ where: { uid, status: true } });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    (await user).update({ status: false });
    throw new HttpException({ msg: userMsg.unregister }, 200);
  }
}
