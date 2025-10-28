import { Injectable } from '@nestjs/common';
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { ClaimsService } from '../claims/claims.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '../config/config.service';
import { TenantsService } from '../tenants/tenants.service';
import { Claim } from '../claims/entities/claim.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GrpcService {
  constructor(
    private claimsService: ClaimsService,
    private usersService: UsersService,
    private authService: AuthService,
    private configService: ConfigService,
    private tenantsService: TenantsService
  ) {}

  // Claims gRPC methods
  async createClaim(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { identification_number, status, data, user_id } = call.request;
      const claim = await this.claimsService.create(
        {
          identificationNumber: identification_number,
          status: status as any,
          data: JSON.parse(data),
        },
        user_id
      );

      callback(null, {
        id: claim.id,
        identification_number: claim.identificationNumber,
        status: claim.status,
        data: JSON.stringify(claim.data),
        user_id: claim.userId,
        created_at: claim.createdAt.toISOString(),
        updated_at: claim.updatedAt.toISOString(),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async getClaim(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id } = call.request;
      const claim = await this.claimsService.findOne(id);

      callback(null, {
        id: claim.id,
        identification_number: claim.identificationNumber,
        status: claim.status,
        data: JSON.stringify(claim.data),
        user_id: claim.userId,
        created_at: claim.createdAt.toISOString(),
        updated_at: claim.updatedAt.toISOString(),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async updateClaim(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id, identification_number, status, data } = call.request;
      const claim = await this.claimsService.update(id, {
        identificationNumber: identification_number,
        status: status as any,
        data: JSON.parse(data),
      });

      callback(null, {
        id: claim.id,
        identification_number: claim.identificationNumber,
        status: claim.status,
        data: JSON.stringify(claim.data),
        user_id: claim.userId,
        created_at: claim.createdAt.toISOString(),
        updated_at: claim.updatedAt.toISOString(),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async deleteClaim(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id } = call.request;
      await this.claimsService.remove(id);
      callback(null, { success: true });
    } catch (error) {
      callback(error, null);
    }
  }

  async listClaims(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { user_id } = call.request;
      const claims = await this.claimsService.findAll(user_id);

      const claimsList = claims.map((claim: Claim) => ({
        id: claim.id,
        identification_number: claim.identificationNumber,
        status: claim.status,
        data: JSON.stringify(claim.data),
        user_id: claim.userId,
        created_at: claim.createdAt.toISOString(),
        updated_at: claim.updatedAt.toISOString(),
      }));

      callback(null, { claims: claimsList });
    } catch (error) {
      callback(error, null);
    }
  }

  // Users gRPC methods
  async createUser(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { email, name, password, role, tenant_id, external_id } =
        call.request;
      const user = await this.usersService.create({
        email,
        name,
        password,
        role: role as any,
        tenantId: tenant_id,
        externalId: external_id,
      });

      callback(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenantId,
        external_id: user.externalId || '',
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async getUser(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) {
    try {
      const { id } = call.request;
      const user = await this.usersService.findOne(id);

      callback(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenantId,
        external_id: user.externalId || '',
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async updateUser(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id, email, name, password, role, tenant_id, external_id } =
        call.request;
      const user = await this.usersService.update(id, {
        email,
        name,
        password,
        role: role as any,
        tenantId: tenant_id,
        externalId: external_id,
      });

      callback(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenantId,
        external_id: user.externalId || '',
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async deleteUser(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id } = call.request;
      await this.usersService.remove(id);
      callback(null, { success: true });
    } catch (error) {
      callback(error, null);
    }
  }

  async listUsers(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const users = await this.usersService.findAll();

      const usersList = users.map((user: User) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenantId,
        external_id: user.externalId || '',
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      }));

      callback(null, { users: usersList });
    } catch (error) {
      callback(error, null);
    }
  }

  // Auth gRPC methods
  async login(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>) {
    try {
      const { email, password } = call.request;
      const result = await this.authService.login({ email, password });

      callback(null, {
        access_token: result.access_token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          tenant_id: result.user.tenantId,
          external_id: result.user.externalId || '',
        },
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async register(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { email, password, name, tenant_id } = call.request;
      const user = await this.authService.register(
        email,
        password,
        name,
        tenant_id
      );

      callback(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenantId,
        external_id: user.externalId || '',
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async getProfile(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      // For gRPC, authentication would be handled via metadata/interceptors
      // This is a placeholder - you'd need to implement JWT validation
      callback(null, {
        user_id: '',
        email: '',
        role: '',
        tenant_id: '',
      });
    } catch (error) {
      callback(error, null);
    }
  }

  // Config gRPC methods
  async getConfig(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { tenant_id } = call.request;
      const config = await this.configService.getConfig(tenant_id);

      callback(null, {
        id: 'main',
        data: JSON.stringify(config),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async getConfigForWidget(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { api_key } = call.request; // tenantId passed as api_key
      const config = await this.configService.getConfig(api_key);

      callback(null, {
        id: 'main',
        data: JSON.stringify(config),
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async getClaimFormSteps(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { tenant_id } = call.request;
      const steps = await this.configService.getClaimFormStepsAsync(tenant_id);

      const stepsList = steps.map(step => ({
        id: step.id,
        name: step.title,
        description: step.description || '',
        order: step.fields?.[0]?.order || 0,
        fields: step.fields.map(field => ({
          id: field.id,
          name: field.label,
          type: field.type.toLowerCase(),
          required: field.required,
          options: field.options || [],
          order: field.order || 0,
        })),
      }));

      callback(null, { steps: stepsList });
    } catch (error) {
      callback(error, null);
    }
  }

  async updateConfig(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { config_data, tenant_id } = call.request;
      const config = JSON.parse(config_data);
      await this.configService.updateConfig(config, tenant_id);

      callback(null, { message: 'Configuration updated successfully' });
    } catch (error) {
      callback(error, null);
    }
  }

  // Tenants gRPC methods
  async createTenant(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { name, logo } = call.request;
      const tenant = await this.tenantsService.create({ name, logo });

      callback(null, {
        id: tenant.id,
        name: tenant.name,
        logo: tenant.logo || '',
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async getTenant(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id } = call.request;
      const tenant = await this.tenantsService.findOne(id);

      callback(null, {
        id: tenant.id,
        name: tenant.name,
        logo: tenant.logo || '',
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async updateTenant(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id, name, logo } = call.request;
      const tenant = await this.tenantsService.update(id, { name, logo });

      callback(null, {
        id: tenant.id,
        name: tenant.name,
        logo: tenant.logo || '',
      });
    } catch (error) {
      callback(error, null);
    }
  }

  async deleteTenant(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const { id } = call.request;
      await this.tenantsService.remove(id);
      callback(null, { success: true });
    } catch (error) {
      callback(error, null);
    }
  }

  async listTenants(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ) {
    try {
      const tenants = await this.tenantsService.findAll(false);

      const tenantsList = tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        logo: tenant.logo || '',
      }));

      callback(null, { tenants: tenantsList });
    } catch (error) {
      callback(error, null);
    }
  }
}
