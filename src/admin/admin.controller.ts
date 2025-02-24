import {
  Controller,
  Get,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  @Get()
  async getadmins(@Req() request: Request) {
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
}
