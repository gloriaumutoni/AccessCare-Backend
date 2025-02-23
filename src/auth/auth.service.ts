import { AdminService } from './../admin/admin.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly adminService: AdminService) {}
}
