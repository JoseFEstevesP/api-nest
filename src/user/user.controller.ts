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
import { ApiTags } from '@nestjs/swagger';
import { booleanStatus } from 'src/functions/booleanStatus';
import { validateMiddleware } from 'src/middlewares/validateMiddleware';
import { Permission } from 'src/rol/enum/permissions';
import { ReqUidDTO } from '../dto/ReqUid.dto';
import { UserDeleteDTO } from './dto/UserDelete.dto';
import { UserUpdateDTO } from './dto/UserUpdate.dto';
import { UserUpdateProfileDataDTO } from './dto/UserUpdateProfileData.dto';
import { UserUpdateProfileEmailDTO } from './dto/UserUpdateProfileEmail.dto';
import { UserUpdateProfilePasswordDTO } from './dto/UserUpdateProfilePassword.dto';
import { UserGetDTO } from './dto/userGet.dto';
import { UserGetAllDTO } from './dto/userGetAll.dto';
import { UserLoginDTO } from './dto/userLogin.dto';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { JwtAuthGuard } from './jwtUser.guard';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() data: UserRegisterDTO) {
    return this.userService.create({ data });
  }

  @Post('/login')
  loginUser(@Body() data: UserLoginDTO) {
    return this.userService.login({ data });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async profileUser(@Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userProfile,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.profile({ uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/one/:uid')
  async getUser(@Param() data: UserGetDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userReadOne,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.findOne({ uid: data.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUser(@Query() filter: UserGetAllDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userRead,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.findAll({
      ...filter,
      uid: req.user.uid,
      status: booleanStatus({ status: filter.status }),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Body() data: UserUpdateDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userUpdate,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.update({ data });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/data')
  async updateProfile(
    @Body() data: UserUpdateProfileDataDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userProfile,
    });
    if (validate?.errors) throw new HttpException(validate, 401);
    return this.userService.updateProfile({ data, uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/email')
  async updateProfileEmail(
    @Body() data: UserUpdateProfileEmailDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userProfile,
    });
    if (validate?.errors) throw new HttpException(validate, 401);
    return this.userService.updateProfileEmail({ data, uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/password')
  async updateProfilePassword(
    @Body() data: UserUpdateProfilePasswordDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userProfile,
    });
    if (validate?.errors) throw new HttpException(validate, 401);
    return this.userService.updateProfilePassword({ data, uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/profile/unregister')
  async unregister(@Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userProfile,
    });
    if (validate?.errors) throw new HttpException(validate, 401);
    return this.userService.unregister({ uid: req.user.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:uid')
  async delete(@Param() data: UserDeleteDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.userDelete,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.userService.deleteItem({ uid: data.uid });
  }
}
