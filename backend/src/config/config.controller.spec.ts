import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService, AppConfig } from './config.service';

describe('ConfigController', () => {
  let controller: ConfigController;
  let configService: ConfigService;

  const mockConfigService = {
    getConfig: jest.fn(),
    getClaimFormStepsAsync: jest.fn(),
    updateConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ConfigController>(ConfigController);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConfigForWidget', () => {
    it('should return config for widget using API-Key header', async () => {
      const tenantId = 'tenant-id';
      const mockConfig: AppConfig = {
        version: '1.0.0',
        color: 'teal',
        abTest: {
          fileUploadMethod: 'drag-drop',
        },
        claimForm: {
          steps: [],
        },
      };

      mockConfigService.getConfig.mockResolvedValue(mockConfig);

      const result = await controller.getConfigForWidget(tenantId);

      expect(result).toEqual(mockConfig);
      expect(configService.getConfig).toHaveBeenCalledWith(tenantId);
    });

    it('should throw BadRequestException when API-Key header is missing', async () => {
      await expect(controller.getConfigForWidget(null)).rejects.toThrow(
        BadRequestException
      );
      expect(configService.getConfig).not.toHaveBeenCalled();
    });
  });

  describe('getConfig', () => {
    it('should return config for current user tenant', async () => {
      const mockRequest = {
        user: {
          tenantId: 'tenant-id',
        },
      };

      const mockConfig: AppConfig = {
        version: '1.0.0',
        color: 'blue',
        abTest: {
          fileUploadMethod: 'dialog',
        },
        claimForm: {
          steps: [],
        },
      };

      mockConfigService.getConfig.mockResolvedValue(mockConfig);

      const result = await controller.getConfig(mockRequest);

      expect(result).toEqual(mockConfig);
      expect(configService.getConfig).toHaveBeenCalledWith(
        mockRequest.user.tenantId
      );
    });
  });

  describe('getClaimFormSteps', () => {
    it('should return claim form steps for current user tenant', async () => {
      const mockRequest = {
        user: {
          tenantId: 'tenant-id',
        },
      };

      const mockSteps = [
        {
          id: 'step-1',
          title: 'Step 1',
          description: 'First step',
          order: 1,
          fields: [],
        },
      ];

      mockConfigService.getClaimFormStepsAsync.mockResolvedValue(mockSteps);

      const result = await controller.getClaimFormSteps(mockRequest);

      expect(result).toEqual(mockSteps);
      expect(configService.getClaimFormStepsAsync).toHaveBeenCalledWith(
        mockRequest.user.tenantId
      );
    });
  });

  describe('updateConfig', () => {
    it('should update configuration for current user tenant', async () => {
      const mockRequest = {
        user: {
          tenantId: 'tenant-id',
        },
      };

      const updatedConfig: AppConfig = {
        version: '1.1.0',
        color: 'purple',
        abTest: {
          fileUploadMethod: 'dialog',
        },
        claimForm: {
          steps: [
            {
              id: 'step-1',
              title: 'New Step',
              order: 1,
              fields: [],
            },
          ],
        },
      };

      mockConfigService.updateConfig.mockResolvedValue(undefined);

      const result = await controller.updateConfig(updatedConfig, mockRequest);

      expect(result).toEqual({
        message: 'Configuration updated successfully',
      });
      expect(configService.updateConfig).toHaveBeenCalledWith(
        updatedConfig,
        mockRequest.user.tenantId
      );
    });
  });
});
