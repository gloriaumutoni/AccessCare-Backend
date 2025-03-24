import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentsService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: number;
    role: string;
  };
}

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentsService) {}

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

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() request: RequestWithUser) {
    if (request.user.role === 'patient') {
      return this.appointmentService.findByPatient(request.user.id);
    }
    if (request.user.role === 'doctor') {
      return this.appointmentService.findByDoctor(request.user.id);
    }
    return this.appointmentService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(+id);
  }
}
