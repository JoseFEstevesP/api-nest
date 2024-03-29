import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Order } from 'src/constants/order';

export class queryDTO {
  @IsString({ message: 'El estatus tiene que ser de tipo string' })
  @IsOptional()
  readonly status?: string;

  @IsString({ message: 'La página tiene que ser una cadena de texto' })
  readonly page: string;

  @IsString({ message: 'El límite tiene que ser una cadena de texto' })
  readonly limit: string;

  @IsEnum(Order, { message: 'El orden no es válido' })
  readonly order: Order;
}
