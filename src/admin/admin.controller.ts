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
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dtos/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  @Get()
  async getAdmins(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie); // transform jwt token to its original data
      if (!data) {
        throw new UnauthorizedException();
      }
      const admin = await this.adminService.findAll();
      return admin;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Put(':id')
  async updateAdmin(@Param('id') id: string, @Body() body: UpdateAdminDto) {
    const admin = await this.adminService.findById(+id);
    let hashedPassword;
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    if (!(await bcrypt.compare(body.password, admin.password))) {
      hashedPassword = await bcrypt.hash(body.password, 10);
    }

    this.adminService.update(+id, { ...body, password: hashedPassword });
    return { message: 'success' };
  }

  @Delete(':id')
  deleteAdmin(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
