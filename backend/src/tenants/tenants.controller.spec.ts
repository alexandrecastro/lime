import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

describe('TenantsController', () => {
  let controller: TenantsController;
  let tenantsService: TenantsService;

  const mockTenantsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantsService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    tenantsService = module.get<TenantsService>(TenantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of tenants (public endpoint)', async () => {
      const mockTenants = [
        {
          id: 'tenant-1',
          name: 'Tenant 1',
          logo: 'logo1.png',
        },
        {
          id: 'tenant-2',
          name: 'Tenant 2',
          logo: 'logo2.png',
        },
      ];

      mockTenantsService.findAll.mockResolvedValue(mockTenants);

      const result = await controller.findAll();

      expect(result).toEqual(mockTenants);
      expect(tenantsService.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findOneForWidget', () => {
    it('should return tenant by API-Key header (public endpoint)', async () => {
      const tenantId = 'tenant-id';
      const mockTenant = {
        id: tenantId,
        name: 'Test Tenant',
        logo: 'logo.png',
      };

      mockTenantsService.findOne.mockResolvedValue(mockTenant);

      const headers = {
        'API-Key': tenantId,
      };

      const result = await controller.findOneForWidget(headers['API-Key']);

      expect(result).toEqual(mockTenant);
      expect(tenantsService.findOne).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'New Tenant',
        logo: 'new-logo.png',
      };

      const mockTenant = {
        id: 'new-tenant-id',
        ...createTenantDto,
      };

      mockTenantsService.create.mockResolvedValue(mockTenant);

      const result = await controller.create(createTenantDto);

      expect(result).toEqual(mockTenant);
      expect(tenantsService.create).toHaveBeenCalledWith(createTenantDto);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const tenantId = 'tenant-id';
      const mockTenant = {
        id: tenantId,
        name: 'Test Tenant',
        logo: 'logo.png',
      };

      mockTenantsService.findOne.mockResolvedValue(mockTenant);

      const result = await controller.findOne(tenantId);

      expect(result).toEqual(mockTenant);
      expect(tenantsService.findOne).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const tenantId = 'tenant-id';
      const updateTenantDto: UpdateTenantDto = {
        name: 'Updated Tenant',
      };

      const mockUpdatedTenant = {
        id: tenantId,
        name: 'Updated Tenant',
        logo: 'logo.png',
      };

      mockTenantsService.update.mockResolvedValue(mockUpdatedTenant);

      const result = await controller.update(tenantId, updateTenantDto);

      expect(result).toEqual(mockUpdatedTenant);
      expect(tenantsService.update).toHaveBeenCalledWith(
        tenantId,
        updateTenantDto
      );
    });
  });

  describe('remove', () => {
    it('should delete a tenant', async () => {
      const tenantId = 'tenant-id';

      mockTenantsService.remove.mockResolvedValue(undefined);

      await controller.remove(tenantId);

      expect(tenantsService.remove).toHaveBeenCalledWith(tenantId);
    });
  });
});
