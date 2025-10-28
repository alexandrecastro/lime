import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      name: createTenantDto.name,
      logo: createTenantDto.logo || null,
    });
    return this.tenantRepository.save(tenant);
  }

  async findAll(includeUsers = false): Promise<Tenant[]> {
    return this.tenantRepository.find({
      relations: includeUsers ? ['users'] : [],
    });
  }

  async findOne(id: string, includeUsers = false): Promise<Tenant> {
    return this.tenantRepository.findOne({
      where: { id },
      relations: includeUsers ? ['users'] : [],
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }
}
