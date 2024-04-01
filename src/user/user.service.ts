import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { compare, hash } from 'bcrypt';
import { Op } from 'sequelize';
import { Order } from 'src/constants/order';
import { EmailService } from 'src/services/email.service';
import { ResData, ResList } from 'src/types';
import { salt } from './constants/sal';
import { User } from './entities/user.entities';
import { OrderUserProperty } from './enum/orderProperty';
import { validateUserLogin } from './functions/validateUserLogin';
import { validateUser } from './functions/validateUserRegister';
import {
  DataUserGetAll,
  DataUserLogin,
  DataUserOfExtraData,
  DataUserUpdate,
  DataUserUpdateProfile,
  DataUserUpdateProfileEmail,
  GetUsers,
  ResUser,
  ReturnLoginUser,
} from './user';
import { userMsg } from './user.msg';

const excludeColum: string[] = [
  'password',
  'status',
  'createdAt',
  'updatedAt',
  'activatedAccount',
  'code',
];

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async create({ data }: { data: DataUserOfExtraData }): ResData {
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

    const code = crypto.randomUUID();
    const token = this.jwtService.sign({
      code,
      ci,
    });
    this.emailService.activatedAccount({ code: token, email });

    const hashPass = await hash(password, salt);
    const user = await this.userModel.create({
      ...data,
      password: hashPass,
      code,
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

  async findOne({ uid }: { uid: string }): ResUser {
    const user = await this.userModel.findOne({
      where: { uid, status: true },
      attributes: {
        exclude: excludeColum,
      },
    });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    throw new HttpException(user, 200);
  }

  async findAll(filter: GetUsers): ResList<DataUserGetAll> {
    const {
      limit,
      page,
      search,
      status = true,
      orderProperty = OrderUserProperty.name,
      order = Order.ASC,
    } = filter;
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
        exclude: excludeColum,
      },
      limit: li,
      offset: (pa - 1) * li,
      order: [[orderProperty, order]],
    });

    const pages = Math.ceil(count / li);
    const totalPage = pa > pages ? pages : pa;
    const nextPage = totalPage + 1;
    const previousPage = totalPage - 1;

    const data: Array<User> = rows.filter((item) => item.uid !== filter.uid);

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
    const user = await this.userModel.findOne({ where: { uid } });

    if (!user) {
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);
    }

    (await user).update({ status: false });
    throw new HttpException({ msg: userMsg.unregister }, 200);
  }

  async deleteItem({ uid }: { uid: string }): ResData {
    const user = await this.userModel.findOne({ where: { uid, status: true } });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    (await user).update({ status: false });
    throw new HttpException({ msg: userMsg.unregister }, 200);
  }

  async recoveryPassword({ email }: { email: string }): ResData {
    const user = await this.userModel.findOne({
      where: { email, status: true },
    });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);
    const code = crypto.randomUUID();

    await user.update({ code });

    const token = this.jwtService.sign({
      code,
      email,
    });
    this.emailService.recoveryPassword({ code: token, email });

    throw new HttpException({ msg: userMsg.recoveryPassword }, 200);
  }

  async recoveryPass({ code }: { code: string }): ResData {
    const { code: codeVerify, email } = await this.jwtService.verify(code, {
      publicKey: process.env.JWT_KEY,
    });
    const user = await this.userModel.findOne({
      where: { email, code: codeVerify, status: true },
    });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    const newPassword = `Farmapatria-${user.ci}`;
    const hashPass = await hash(newPassword, salt);
    await user.update({
      password: hashPass,
      code: null,
    });

    throw new HttpException({ msg: `Nueva contraseña: ${newPassword}` }, 200);
  }

  async activatedAccount({ code }: { code: string }): ResData {
    const { code: codeVerify, ci } = await this.jwtService.verify(code, {
      publicKey: process.env.JWT_KEY,
    });

    const user = await this.userModel.findOne({
      where: { ci, code: codeVerify, status: true },
    });

    if (!user)
      throw new HttpException({ errors: [{ uid: userMsg.findOne }] }, 409);

    await user.update({
      code: null,
      activatedAccount: true,
    });

    throw new HttpException(
      { msg: `Cuenta activada inicie sesión para continuar.` },
      200,
    );
  }
}
