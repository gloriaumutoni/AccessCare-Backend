import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class ChangeRoleDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(Role)
  @IsNotEmpty()
  newRole: Role;
}
