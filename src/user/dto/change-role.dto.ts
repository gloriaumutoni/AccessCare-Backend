import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { Type } from 'class-transformer';
export class ChangeRoleDto {
  @IsNotEmpty()
  @Type(() => Number) // Add this to automatically transform string to number
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsEnum(Role)
  newRole: Role;
}
