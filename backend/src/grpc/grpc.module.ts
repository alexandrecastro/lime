import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrpcController } from './grpc.controller';
import { GrpcService } from './grpc.service';
import { ClaimsModule } from '../claims/claims.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { TenantsModule } from '../tenants/tenants.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    ClaimsModule,
    UsersModule,
    AuthModule,
    ConfigModule,
    TenantsModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [GrpcController],
  providers: [GrpcService],
})
export class GrpcModule {}
