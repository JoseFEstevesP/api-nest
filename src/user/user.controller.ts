import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiTags } from '@nestjs/swagger';
import { Rol } from 'src/rol/entities/rol.entity';
import { ReqUidDTO } from '../dto/ReqUid.dto';
import { UserDeleteDTO } from './dto/UserDelete.dto';
import { UserSearchDTO } from './dto/UserSearch.dto';
import { UserUpdateDTO } from './dto/UserUpdate.dto';
import { UserUpdateProfileDataDTO } from './dto/UserUpdateProfileData.dto';
import { UserUpdateProfileEmailDTO } from './dto/UserUpdateProfileEmail.dto';
import { UserUpdateProfilePasswordDTO } from './dto/UserUpdateProfilePassword.dto';
import { UserGetDTO } from './dto/userGet.dto';
import { UserGetAllDTO } from './dto/userGetAll.dto';
import { UserLoginDTO } from './dto/userLogin.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { JwtAuthGuard } from './jwtUser.guard';
import { deleteMiddleware } from './middleware/delete';
import { getAllMiddleware } from './middleware/getAll';
import { getOneMiddleware } from './middleware/getOne';
import { profileMiddleware } from './middleware/profile';
import { searchMiddleware } from './middleware/search';
import { updateMiddleware } from './middleware/update';
import { ResListUser } from './user';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectModel(Rol) private readonly rolModel: typeof Rol,
  ) {}

  @Post()
  createUser(@Body() newUser: UserRegisterDTO) {
    return this.userService.register({ data: newUser });
  }

  @Post('/login')
  loginUser(@Body() loginUser: UserLoginDTO) {
    return this.userService.login({ data: loginUser });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async profileUser(@Req() req: ReqUidDTO) {
    const validate = await profileMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.profile({ uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/one/:uid')
  async getUser(@Param() data: UserGetDTO, @Req() req: ReqUidDTO) {
    const validate = await getOneMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.findOneUser({ uid: data.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUser(
    @Query() { limit, order, orderProperty, page, status }: UserGetAllDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await getAllMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.findAll({
      uid: req.user.uid,
      limit: +limit,
      order,
      orderProperty,
      page: +page,
      status,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  async getSearchUser(
    @Query()
    { limit, order, orderProperty, page, status, search }: UserSearchDTO,
    @Req() req: ReqUidDTO,
  ): ResListUser {
    const validate = await searchMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.findSearch({
      uid: req.user.uid,
      limit: +limit,
      order: order,
      orderProperty: orderProperty,
      page: +page,
      status: status,
      search: search,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Body() data: UserUpdateDTO, @Req() req: ReqUidDTO) {
    const validate = await updateMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.update({ data });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/data')
  async updateProfile(
    @Body() data: UserUpdateProfileDataDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await profileMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.updateProfile({ data, uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/email')
  async updateProfileEmail(
    @Body() data: UserUpdateProfileEmailDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await profileMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.updateProfileEmail({ data, uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/password')
  async updateProfilePassword(
    @Body() data: UserUpdateProfilePasswordDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await profileMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.updateProfilePassword({ data, uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/profile/unregister')
  async unregister(@Req() req: ReqUidDTO) {
    const validate = await profileMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.unregister({ uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:uid')
  async delete(@Param() data: UserDeleteDTO, @Req() req: ReqUidDTO) {
    const validate = await deleteMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.deleteUser({ uid: data.uid });
  }
}
