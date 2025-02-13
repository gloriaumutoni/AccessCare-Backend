import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.usersService.create(body.name, body.email, hashedPassword);
  }

  @Post('/login')
  async login(@Body() body: Partial<CreateUserDto>) {
    if (body.email) {
      const users = await this.usersService.findOne(body.email);
      if (!users) {
        throw new BadRequestException('Invalid credentials');
      }
      if (body.password)
        if (!(await bcrypt.compare(body.password, users.password))) {
          throw new BadRequestException('Invalid credentials');
        }
      return users;
    }
  }
}
