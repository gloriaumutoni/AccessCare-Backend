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
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getUsers() {
    try {
      const users = await this.userService.findAll();
      return users;
    } catch (error) {
      throw new UnauthorizedException('Failed to fetch users');
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

  @Put('change-role')
  @UseGuards(AdminGuard)
  async changeRole(@Body() changeRoleDto: ChangeRoleDto) {
    return this.userService.changeRole(changeRoleDto);
  }
}
