import {
  BadRequestException,
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
import { Role } from '../common/enums/role.enum';

interface RequestWithUser extends Request {
  user: {
    id: number;
    role: string;
  };
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Get('doctors')
  @UseGuards(JwtAuthGuard)
  async getDoctors() {
    return this.userService.findByRole(Role.DOCTOR);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getUsers(@Req() request: RequestWithUser) {
    try {
      const users = await this.userService.findAll();
      const filteredUsers = users.filter((user) => user.id !== request.user.id);
      return filteredUsers;
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
    const userId = parseInt(changeRoleDto.userId as any, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    changeRoleDto.userId = userId;
    return this.userService.changeRole(changeRoleDto);
  }
}
