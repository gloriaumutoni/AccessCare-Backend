import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard, AdminGuard],
})
export class UserModule {}
