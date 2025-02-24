import { App } from 'supertest/types';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsController } from './appointment.controller';
import { AppointmentsService } from './appointment.service';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Appointment]),
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1d' } }),
  ],
  exports: [AppointmentsService],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AdminService],
})
export class AppointmentModule {}
