import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class DoctorActionDto {
  @IsEnum(AppointmentStatus)
  action: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  newStartDate?: string;

  @IsOptional()
  @IsString()
  newEndDate?: string;
}
