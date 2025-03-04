import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  create(user: Omit<User, 'id'>) {
    return this.userRepository.save({ ...user });
  }

  findOne(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  findAll() {
    return this.userRepository.find();
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
