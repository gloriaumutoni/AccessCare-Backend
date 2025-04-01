import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Param,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { AppointmentsService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { DoctorActionDto } from './dto/doctor-action.dto';
import { UserService } from '../user/user.service';
import { Role } from '../common/enums/role.enum';

interface RequestWithUser extends Request {
  user: {
    id: number;
    role: string;
  };
}

@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentsService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() request: RequestWithUser,
  ) {
    try {
      const result = await this.appointmentService.create(
        createAppointmentDto,
        request.user.id,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('doctors')
  @UseGuards(JwtAuthGuard)
  async getAvailableDoctors(@Req() request: RequestWithUser) {
    if (request.user.role !== 'patient' && request.user.role !== 'admin') {
      throw new ForbiddenException(
        'Only patients and administrators can view available doctors',
      );
    }
    return this.userService.findByRole(Role.DOCTOR);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getMyAppointments(@Req() request: RequestWithUser) {
    if (request.user.role === 'admin') {
      return this.appointmentService.findAll();
    }
    if (request.user.role === 'patient') {
      return this.appointmentService.findByPatient(request.user.id);
    }
    if (request.user.role === 'doctor') {
      return this.appointmentService.findByDoctor(request.user.id);
    }
    throw new ForbiddenException('Unauthorized to view appointments');
  }

  @Get('patient-appointments')
  @UseGuards(JwtAuthGuard)
  async getPatientAppointmentsForDoctor(@Req() request: RequestWithUser) {
    if (request.user.role !== 'doctor') {
      throw new ForbiddenException(
        'Only doctors can view patient appointments',
      );
    }
    return this.appointmentService.findPatientAppointmentsForDoctor(
      request.user.id,
    );
  }

  @Get('appointments-history')
  @UseGuards(JwtAuthGuard)
  async getMyAppointmentsHistory(@Req() request: RequestWithUser) {
    if (request.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can view their appointments');
    }

    return this.appointmentService.findPatientAppointmentsByStatus(
      request.user.id,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAppointment(
    @Param('id') id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() request: RequestWithUser,
  ) {
    if (request.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can reschedule appointments');
    }

    return this.appointmentService.update(
      id,
      updateAppointmentDto,
      request.user.id,
    );
  }

  @Patch(':id/doctor-action')
  @UseGuards(JwtAuthGuard)
  async handleDoctorAction(
    @Param('id') id: number,
    @Body() actionDto: DoctorActionDto,
    @Req() request: RequestWithUser,
  ) {
    if (request.user.role !== 'doctor') {
      throw new ForbiddenException('Only doctors can perform this action');
    }

    return this.appointmentService.handleDoctorAction(
      id,
      request.user.id,
      actionDto,
    );
  }
}
