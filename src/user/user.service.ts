import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { Role } from '../common/enums/role.enum';

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
    if (isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    return this.userRepository.findOneBy({ id });
  }

  findByRole(role: Role) {
    return this.userRepository.find({
      where: { role },
      select: ['id', 'username', 'email', 'role'], // Exclude password
    });
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

  async changeRole(changeRoleDto: ChangeRoleDto): Promise<User> {
    const user = await this.findById(changeRoleDto.userId);

    if (!user) {
      throw new NotFoundException(
        `User with ID ${changeRoleDto.userId} not found`,
      );
    }

    user.role = changeRoleDto.newRole;
    return this.userRepository.save(user);
  }
}
