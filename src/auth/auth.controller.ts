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
  async createuser(@Body() body: CreateUserDto) {
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
    @Body() body: Exclude<CreateUserDto, 'username'>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne(body.email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    if (!(await bcrypt.compare(body.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    const jwt = await this.jwtService.signAsync({ id: user.id });
    response.cookie('jwt', jwt, { httpOnly: true });
    return { access_token: jwt, user };
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { message: 'success' };
  }
}
