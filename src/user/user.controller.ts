import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Get()
  async getUsers(@Req() request: Request) {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      console.log(token);
      if (!token) {
        throw new UnauthorizedException();
      }
      const data = await this.jwtService.verifyAsync(token);
      if (!data) {
        throw new UnauthorizedException();
      }
      const admin = await this.userService.findAll();
      return admin;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const admin = await this.userService.findById(+id);
    let hashedPassword;
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    if (!(await bcrypt.compare(body.password, admin.password))) {
      hashedPassword = await bcrypt.hash(body.password, 10);
    }

    this.userService.update(+id, { ...body, password: hashedPassword });
    return { message: 'success' };
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
