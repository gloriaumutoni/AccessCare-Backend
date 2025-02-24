import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/admin.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly adminService: AdminService,
  ) {}
  async create(
    createAppointmentDto: CreateAppointmentDto,
    id: number,
    user: number,
  ): Promise<Appointment> {
    try {
      if (
        dayjs(createAppointmentDto.start_date).isAfter(
          dayjs(createAppointmentDto.end_date),
        )
      ) {
        throw new BadRequestException('Start date must be before end date');
      }
      if (user === +id) {
        throw new BadRequestException(
          'You cannot create an appointment with yourself',
        );
      }
      const provider = await this.adminService.findById(id);
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }
      const owner = await this.adminService.findById(user);
      if (!owner) {
        throw new NotFoundException('Owner not found');
      }
      const allAppointments = await this.appointmentRepository.find();
      const appointmentsOfThisHealthCareWorker = allAppointments.filter(
        (appointment) => {
          return appointment.provider.id === +id;
        },
      );
      const isThereAnyAppointment = appointmentsOfThisHealthCareWorker.some(
        (appointment) =>
          dayjs(createAppointmentDto.start_date).isSame(
            dayjs(appointment.start_date),
          ) ||
          dayjs(createAppointmentDto.end_date).isSame(
            dayjs(appointment.end_date),
          ) ||
          (dayjs(createAppointmentDto.start_date).isAfter(
            dayjs(appointment.start_date),
          ) &&
            dayjs(createAppointmentDto.start_date).isBefore(
              dayjs(appointment.end_date),
            )) ||
          (dayjs(createAppointmentDto.end_date).isAfter(
            dayjs(appointment.start_date),
          ) &&
            dayjs(createAppointmentDto.end_date).isBefore(
              dayjs(appointment.end_date),
            )),
      );
      if (isThereAnyAppointment) {
        throw new ConflictException(
          'This health worker has an appointment at this time',
        );
      }

      const appointment = this.appointmentRepository.create({
        ...createAppointmentDto,
        provider,
        owner,
      });
      await this.appointmentRepository.save(appointment);
      return appointment;
    } catch (error) {
      console.log(error);
      if (error instanceof ConflictException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  async findAll() {
    try {
      return await this.appointmentRepository.find();
    } catch (error) {
      throw error;
    }
  }
  async findOne(id: number): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
      });
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      return appointment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Error while fetching appointment',
        );
      }
    }
  }

  async findAllMyAppointments(id: number): Promise<Appointment[]> {
    try {
      const appointments = await this.appointmentRepository.find();
      const providerAppointments = appointments?.filter(
        (appointment) => appointment.provider.id === +id,
      );

      if (providerAppointments.length === 0) {
        throw new NotFoundException('providerAppointments not found');
      }
      return providerAppointments;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error while fetching appointment',
      );
    }
  }

  async findAllWomanAppointments(id: number): Promise<Appointment[]> {
    try {
      const appointments = await this.appointmentRepository.find();
      const womanAppointmentsFiltered = appointments?.filter(
        (appointment) => appointment?.owner?.id === id,
      );
      if (womanAppointmentsFiltered.length === 0) {
        throw new NotFoundException("You don't have any appointments");
      }
      return womanAppointmentsFiltered;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error while fetching appointment',
      );
    }
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `Updating appointment with id ${id}`;
  }
}
