import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.usersService.create(body.name, body.email, hashedPassword);
  }

  @Post('/login')
  async login(
    @Body() body: Partial<CreateUserDto>,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (body.email) {
      const users = await this.usersService.findOne(body.email);
      if (!users) {
        throw new BadRequestException('Invalid credentials');
      }
      if (body.password)
        if (!(await bcrypt.compare(body.password, users.password))) {
          throw new BadRequestException('Invalid credentials');
        }
      const jwt = await this.jwtService.signAsync({ id: users.id });
      response.cookie('jwt', jwt, { httpOnly: true });
      return { message: 'success' };
    }
  }

  @Get()
  async getUser(@Req() request: Request) {
    try {
      const cookie = request.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie); // transform jwt token to its original data
      if (!data) {
        throw new UnauthorizedException();
      }
      const user = await this.usersService.findById(data['id']);
      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
