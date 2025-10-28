import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AdminController } from './admin.controller';
import { AuthService } from './auth.service';
import { UpdateAdminService } from './update-admin.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 's3cr3t-k3y',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [AuthService, UpdateAdminService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
