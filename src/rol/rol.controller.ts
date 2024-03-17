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
import { ReqUidDTO } from 'src/dto/ReqUid.dto';
import { JwtAuthGuard } from 'src/user/jwtUser.guard';
import { RolDeleteDTO } from './dto/RolDeleteDTO';
import { RolUpdateDTO } from './dto/RolUpdate.dto';
import { RolGetDTO } from './dto/rolGet.dto';
import { RolGetAllDTO } from './dto/rolGetAll.dto';
import { RolRegisterDTO } from './dto/rolRegister.dto';
import { deleteMiddleware } from './middleware/delete';
import { getAllMiddleware } from './middleware/getAll';
import { getOneMiddleware } from './middleware/getOne';
import { registerMiddleware } from './middleware/register';
import { updateMiddleware } from './middleware/update';
import { RolService } from './rol.service';

@ApiTags('Rol')
@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async registerRol(@Body() data: RolRegisterDTO, @Req() req: ReqUidDTO) {
    const validate = await registerMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.register({ data });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/one/:uid')
  async getRol(@Param() data: RolGetDTO, @Req() req: ReqUidDTO) {
    const validate = await getOneMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.findOneRol({ uid: data.uid });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllRol(
    @Query()
    filter: RolGetAllDTO,
    @Req() req: ReqUidDTO,
  ) {
    const validate = await getAllMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.findAll(filter);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Body() data: RolUpdateDTO, @Req() req: ReqUidDTO) {
    const validate = await updateMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.update({ data });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:uid')
  async delete(@Param() data: RolDeleteDTO, @Req() req: ReqUidDTO) {
    const validate = await deleteMiddleware({ uidRol: req.user.uidRol });
    if (validate?.errors) throw new HttpException(validate, 401);

    return this.rolService.deleteRol({ uid: data.uid });
  }
}
