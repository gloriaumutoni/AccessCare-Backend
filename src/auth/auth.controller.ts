import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserService } from '../user/user.service';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.userService.findOne(body.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.userService.create({
      username: body.username,
      email: body.email,
      role: Role.PATIENT,
      password: hashedPassword,
      appointmentsAsProvider: [],
      appointmentsAsOwner: [],
    });

    const { password, ...result } = user;
    return result;
  }

  @Post('/login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne(body.email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

    response.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use secure in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return {
      access_token: jwt,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
    };
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'success' };
  }
}
