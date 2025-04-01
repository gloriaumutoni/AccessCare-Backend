import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Role } from '../common/enums/role.enum';
import { DoctorActionDto } from './dto/doctor-action.dto';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    patientId: number,
  ): Promise<Appointment> {
    const patient = await this.userRepository.findOneBy({ id: patientId });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const doctor = await this.userRepository.findOneBy({
      id: createAppointmentDto.providerId,
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor.role !== 'doctor') {
      throw new BadRequestException('Selected provider is not a doctor');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      owner: patient,
      provider: doctor,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findPatientAppointmentsForDoctor(
    doctorId: number,
  ): Promise<Appointment[]> {
    try {
      // Find all appointments where this doctor is the provider
      const appointments = await this.appointmentRepository.find({
        where: { provider: { id: doctorId } },
        relations: ['owner', 'provider'],
      });

      if (appointments.length === 0) {
        throw new NotFoundException('No appointments found for this doctor');
      }

      return appointments;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error while fetching patient appointments for doctor',
      );
    }
  }

  async findAll() {
    return this.appointmentRepository.find({
      relations: ['owner', 'provider'],
    });
  }

  async findOne(id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ['owner', 'provider'],
    });
  }

  async findByPatient(patientId: number) {
    const appointments = await this.appointmentRepository.find({
      where: { owner: { id: patientId } },
      relations: ['owner', 'provider'],
      order: {
        start_date: 'ASC',
      },
    });

    const statusSummary = {
      pending: appointments.filter(
        (app) => app.status === AppointmentStatus.PENDING,
      ).length,
      accepted: appointments.filter(
        (app) => app.status === AppointmentStatus.ACCEPTED,
      ).length,
      declined: appointments.filter(
        (app) => app.status === AppointmentStatus.DECLINED,
      ).length,
      rescheduled: appointments.filter(
        (app) => app.status === AppointmentStatus.RESCHEDULED,
      ).length,
      completed: appointments.filter(
        (app) => app.status === AppointmentStatus.COMPLETED,
      ).length,
      cancelled: appointments.filter(
        (app) => app.status === AppointmentStatus.CANCELLED,
      ).length,
    };

    return {
      appointments,
      statusSummary,
    };
  }

  async findByDoctor(doctorId: number) {
    return this.appointmentRepository.find({
      where: { provider: { id: doctorId } },
      relations: ['owner', 'provider'],
    });
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

  async handleDoctorAction(
    appointmentId: number,
    doctorId: number,
    actionDto: DoctorActionDto,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
        provider: { id: doctorId },
      },
      relations: ['owner', 'provider'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or unauthorized');
    }

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException('Appointment is not in pending status');
    }

    switch (actionDto.action) {
      case AppointmentStatus.ACCEPTED:
        appointment.status = AppointmentStatus.ACCEPTED;
        break;

      case AppointmentStatus.DECLINED:
        appointment.status = AppointmentStatus.DECLINED;
        break;

      case AppointmentStatus.RESCHEDULED:
        if (!actionDto.newStartDate || !actionDto.newEndDate) {
          throw new BadRequestException(
            'New dates are required for rescheduling',
          );
        }
        appointment.start_date = actionDto.newStartDate;
        appointment.end_date = actionDto.newEndDate;
        appointment.status = AppointmentStatus.RESCHEDULED;
        break;

      default:
        throw new BadRequestException('Invalid action');
    }

    if (actionDto.notes) {
      appointment.notes = actionDto.notes;
    }

    return this.appointmentRepository.save(appointment);
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    patientId: number,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id,
        owner: { id: patientId },
      },
      relations: ['owner', 'provider'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found or unauthorized');
    }

    if (updateAppointmentDto.providerId) {
      const newProvider = await this.userRepository.findOne({
        where: {
          id: updateAppointmentDto.providerId,
          role: Role.DOCTOR,
        },
      });

      if (!newProvider) {
        throw new BadRequestException('Invalid doctor selected');
      }

      appointment.provider = newProvider;
    }

    if (updateAppointmentDto.start_date) {
      appointment.start_date = updateAppointmentDto.start_date;
    }

    if (updateAppointmentDto.end_date) {
      appointment.end_date = updateAppointmentDto.end_date;
    }

    if (updateAppointmentDto.notes) {
      appointment.notes = updateAppointmentDto.notes;
    }

    return this.appointmentRepository.save(appointment);
  }

  async findPatientAppointmentsByDoctorAndStatus(
    patientId: number,
    doctorId?: number,
  ) {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.owner', 'owner')
      .leftJoinAndSelect('appointment.provider', 'provider')
      .where('owner.id = :patientId', { patientId });

    if (doctorId) {
      queryBuilder.andWhere('provider.id = :doctorId', { doctorId });
    }

    const appointments = await queryBuilder.getMany();

    const now = new Date();
    const pastAppointments = appointments.filter(
      (app) => new Date(app.start_date) < now,
    );
    const pendingAppointments = appointments.filter(
      (app) => new Date(app.start_date) >= now,
    );

    return {
      pastAppointments,
      pendingAppointments,
    };
  }

  async findPatientAppointmentsByStatus(patientId: number) {
    const appointments = await this.appointmentRepository.find({
      where: { owner: { id: patientId } },
      relations: ['owner', 'provider'],
      order: {
        start_date: 'DESC',
      },
    });

    const now = new Date();
    const pastAppointments = appointments.filter(
      (app) => new Date(app.start_date) < now,
    );
    const pendingAppointments = appointments.filter(
      (app) => new Date(app.start_date) >= now,
    );

    return {
      pastAppointments,
      pendingAppointments,
    };
  }
}
