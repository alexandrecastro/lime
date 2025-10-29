import { Controller, OnModuleInit } from '@nestjs/common';
import { GrpcService } from './grpc.service';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

@Controller()
export class GrpcController implements OnModuleInit {
  private server: grpc.Server;

  constructor(private grpcService: GrpcService) {}

  onModuleInit() {
    this.server = new grpc.Server();
    this.loadProtoServices();
    this.server.bindAsync(
      '0.0.0.0:50051',
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to start gRPC server:', error);
        } else {
          console.log(`gRPC server running on port ${port}`);
        }
      }
    );
  }

  private loadProtoServices() {
    // Load Claims service
    this.loadClaimsService();

    // Load Users service
    this.loadUsersService();

    // Load Auth service
    this.loadAuthService();

    // Load Config service
    this.loadConfigService();

    // Load Tenants service
    this.loadTenantsService();

    // Load Admin service
    this.loadAdminService();
  }

  private loadClaimsService() {
    const claimsPackageDefinition = protoLoader.loadSync(
      join(__dirname, '../../proto/claims.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const claimsProto = grpc.loadPackageDefinition(
      claimsPackageDefinition
    ) as any;
    const claimsService = claimsProto.claims.ClaimsService.service;

    this.server.addService(claimsService, {
      CreateClaim: this.grpcService.createClaim.bind(this.grpcService),
      CreateClaimForWidget: this.grpcService.createClaimForWidget.bind(
        this.grpcService
      ),
      GetClaim: this.grpcService.getClaim.bind(this.grpcService),
      UpdateClaim: this.grpcService.updateClaim.bind(this.grpcService),
      DeleteClaim: this.grpcService.deleteClaim.bind(this.grpcService),
      ListClaims: this.grpcService.listClaims.bind(this.grpcService),
    });
  }

  private loadUsersService() {
    const usersPackageDefinition = protoLoader.loadSync(
      join(__dirname, '../../proto/users.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const usersProto = grpc.loadPackageDefinition(
      usersPackageDefinition
    ) as any;
    const usersService = usersProto.users.UsersService.service;

    this.server.addService(usersService, {
      CreateUser: this.grpcService.createUser.bind(this.grpcService),
      GetUser: this.grpcService.getUser.bind(this.grpcService),
      UpdateUser: this.grpcService.updateUser.bind(this.grpcService),
      DeleteUser: this.grpcService.deleteUser.bind(this.grpcService),
      ListUsers: this.grpcService.listUsers.bind(this.grpcService),
    });
  }

  private loadAuthService() {
    const authPackageDefinition = protoLoader.loadSync(
      join(__dirname, '../../proto/auth.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const authProto = grpc.loadPackageDefinition(authPackageDefinition) as any;
    const authService = authProto.auth.AuthService.service;

    this.server.addService(authService, {
      Login: this.grpcService.login.bind(this.grpcService),
      Register: this.grpcService.register.bind(this.grpcService),
      GetProfile: this.grpcService.getProfile.bind(this.grpcService),
    });
  }

  private loadConfigService() {
    const configPackageDefinition = protoLoader.loadSync(
      join(__dirname, '../../proto/config.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const configProto = grpc.loadPackageDefinition(
      configPackageDefinition
    ) as any;
    const configService = configProto.config.ConfigService.service;

    this.server.addService(configService, {
      GetConfig: this.grpcService.getConfig.bind(this.grpcService),
      GetConfigForWidget: this.grpcService.getConfigForWidget.bind(
        this.grpcService
      ),
      GetClaimFormSteps: this.grpcService.getClaimFormSteps.bind(
        this.grpcService
      ),
      UpdateConfig: this.grpcService.updateConfig.bind(this.grpcService),
    });
  }

  private loadTenantsService() {
    const tenantsPackageDefinition = protoLoader.loadSync(
      join(__dirname, '../../proto/tenants.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const tenantsProto = grpc.loadPackageDefinition(
      tenantsPackageDefinition
    ) as any;
    const tenantsService = tenantsProto.tenants.TenantsService.service;

    this.server.addService(tenantsService, {
      CreateTenant: this.grpcService.createTenant.bind(this.grpcService),
      GetTenant: this.grpcService.getTenant.bind(this.grpcService),
      GetTenantForWidget: this.grpcService.getTenantForWidget.bind(
        this.grpcService
      ),
      UpdateTenant: this.grpcService.updateTenant.bind(this.grpcService),
      DeleteTenant: this.grpcService.deleteTenant.bind(this.grpcService),
      ListTenants: this.grpcService.listTenants.bind(this.grpcService),
    });
  }

  private loadAdminService() {
    const adminPackageDefinition = protoLoader.loadSync(
      join(__dirname, '../../proto/admin.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      }
    );

    const adminProto = grpc.loadPackageDefinition(
      adminPackageDefinition
    ) as any;
    const adminService = adminProto.admin.AdminService.service;

    this.server.addService(adminService, {
      CreateAdmin: this.grpcService.createAdmin.bind(this.grpcService),
      MakeAdmin: this.grpcService.makeAdmin.bind(this.grpcService),
    });
  }
}
