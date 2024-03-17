import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { queryDTO } from 'src/dto/query.dto';
import { OrderRolProperty } from '../enum/orderProperty';
import { Permission } from '../enum/permissions';

export class RolGetAllDTO extends PartialType(queryDTO) {
  @IsOptional()
  @IsEnum(OrderRolProperty, {
    message: 'La propiedad de orden no es válida',
  })
  readonly orderProperty?: OrderRolProperty;

  @IsOptional()
  @IsEnum(Permission, {
    message: 'La propiedad de permiso no es válida',
  })
  readonly permission?: Permission;
}
