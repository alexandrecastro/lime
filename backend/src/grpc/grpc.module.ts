import { Module } from '@nestjs/common';
import { GrpcController } from './grpc.controller';
import { GrpcService } from './grpc.service';
import { ClaimsModule } from '../claims/claims.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [ClaimsModule, UsersModule, AuthModule, ConfigModule, TenantsModule],
  controllers: [GrpcController],
  providers: [GrpcService],
})
export class GrpcModule {}
