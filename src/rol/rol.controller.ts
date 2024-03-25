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
import { JwtAuthGuard } from 'src/user/jwtUser.guard';
import { ReqUidDTO } from './../dto/ReqUid.dto';
import { RolDeleteDTO } from './dto/RolDelete.dto';
import { RolGetDTO } from './dto/RolGet.dto';
import { RolGetAllDTO } from './dto/RolGetAll.dto';
import { RolRegisterDTO } from './dto/RolRegister.dto';
import { RolUpdateDTO } from './dto/RolUpdate.dto';
import { Permission } from './enum/permissions';
import { RolService } from './rol.service';

@ApiTags('Rol')
@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async registerRol(@Body() data: RolRegisterDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.rolAdd,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.create({ data });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/one/:uid')
  async getRol(@Param() data: RolGetDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.rolReadOne,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.findOne({ uid: data.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllRol(
    @Query()
    filter: RolGetAllDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.rolRead,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.findAll({
      ...filter,
      status: booleanStatus({ status: filter.status }),
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Body() data: RolUpdateDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.rolUpdate,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.update({ data });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:uid')
  async delete(@Param() data: RolDeleteDTO, @Req() req: ReqUidDTO) {
    const validate = await validateMiddleware({
      uidRol: req.user.uidRol,
      permission: Permission.rolDelete,
    });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.remove({ uid: data.uid });
  }
}
