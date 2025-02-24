import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { UpdateAdminDto } from './dtos/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
  ) {}

  create(username: string, email: string, password: string) {
    return this.adminRepository.save({ username, email, password });
  }

  findOne(email: string) {
    return this.adminRepository.findOneBy({ email });
  }

  findById(id: number) {
    return this.adminRepository.findOneBy({ id });
  }

  findAll() {
    return this.adminRepository.find();
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return this.adminRepository.update(id, updateAdminDto);
  }

  remove(id: number) {
    return this.adminRepository.delete(id);
  }
}
