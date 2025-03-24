import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

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
    // Get the patient (owner)
    const patient = await this.userRepository.findOneBy({ id: patientId });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Get the doctor (provider)
    const doctor = await this.userRepository.findOneBy({
      id: createAppointmentDto.providerId,
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Verify the provider is a doctor
    if (doctor.role !== 'doctor') {
      throw new BadRequestException('Selected provider is not a doctor');
    }

    // Create the appointment
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
    return this.appointmentRepository.find({
      where: { owner: { id: patientId } },
      relations: ['owner', 'provider'],
    });
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

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `Updating appointment with id ${id}`;
  }
}
