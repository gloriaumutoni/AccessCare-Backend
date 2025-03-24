import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsService } from './appointment.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { AppointmentController } from './appointment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Appointment]),
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1d' } }),
  ],
  exports: [AppointmentsService],
  controllers: [AppointmentController],
  providers: [AppointmentsService, UserService],
})
export class AppointmentModule {}
