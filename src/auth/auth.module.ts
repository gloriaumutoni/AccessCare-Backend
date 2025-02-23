import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../admin/admin.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1d' } }),
    AdminModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
