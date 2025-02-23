import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { AdminService } from '../admin/admin.service';
import { CreateAdminDto } from '../admin/dtos/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  @Post('/signup')
  async createadmin(@Body() body: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const admin = await this.adminService.create(
      body.username,
      body.email,
      hashedPassword,
    );

    const { password, ...result } = admin;
    return result;
  }

  @Post('/login')
  async login(
    @Body() body: Exclude<CreateAdminDto, 'username'>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const admin = await this.adminService.findOne(body.email);
    console.log(body);
    if (!admin) {
      throw new BadRequestException('Invalid credentials');
    }
    if (!(await bcrypt.compare(body.password, admin.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    const jwt = await this.jwtService.signAsync({ id: admin.id });
    response.cookie('jwt', jwt, { httpOnly: true });
    return { access_token: jwt };
  }

  // @Roles(Role.ADMIN)
  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'success' };
  }
}
