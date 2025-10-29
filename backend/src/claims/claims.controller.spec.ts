import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClaimStatus } from './entities/claim.entity';

describe('ClaimsController', () => {
  let controller: ClaimsController;
  let claimsService: ClaimsService;

  const mockClaimsService = {
    create: jest.fn(),
    createForWidget: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsController],
      providers: [
        {
          provide: ClaimsService,
          useValue: mockClaimsService,
        },
      ],
    }).compile();

    controller = module.get<ClaimsController>(ClaimsController);
    claimsService = module.get<ClaimsService>(ClaimsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createForWidget', () => {
    it('should create a claim via widget with API-Key and User-ID headers', async () => {
      const createClaimDto: CreateClaimDto = {
        data: { field1: 'value1' },
        status: ClaimStatus.OPEN,
      };

      const tenantId = 'tenant-id';
      const externalUserId = 'external-user-id';

      const mockClaim = {
        id: 'claim-id',
        identificationNumber: 'C-123',
        status: ClaimStatus.OPEN,
        data: createClaimDto.data,
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClaimsService.createForWidget.mockResolvedValue(mockClaim);

      const result = await controller.createForWidget(
        tenantId,
        externalUserId,
        createClaimDto
      );

      expect(result).toEqual(mockClaim);
      expect(claimsService.createForWidget).toHaveBeenCalledWith(
        createClaimDto,
        tenantId,
        externalUserId
      );
    });

    it('should throw BadRequestException when API-Key header is missing', async () => {
      const createClaimDto: CreateClaimDto = {
        data: { field1: 'value1' },
      };

      await expect(
        controller.createForWidget(null, 'user-id', createClaimDto)
      ).rejects.toThrow(BadRequestException);
      expect(claimsService.createForWidget).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when User-ID header is missing', async () => {
      const createClaimDto: CreateClaimDto = {
        data: { field1: 'value1' },
      };

      await expect(
        controller.createForWidget('tenant-id', null, createClaimDto)
      ).rejects.toThrow(BadRequestException);
      expect(claimsService.createForWidget).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new claim', async () => {
      const createClaimDto: CreateClaimDto = {
        data: { field1: 'value1' },
        status: ClaimStatus.OPEN,
      };

      const mockRequest = {
        user: {
          userId: 'user-id',
          email: 'user@example.com',
          role: 'user',
          tenantId: 'tenant-id',
        },
      };

      const mockClaim = {
        id: 'claim-id',
        identificationNumber: 'C-123',
        status: ClaimStatus.OPEN,
        data: createClaimDto.data,
        userId: mockRequest.user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClaimsService.create.mockResolvedValue(mockClaim);

      const result = await controller.create(createClaimDto, mockRequest);

      expect(result).toEqual(mockClaim);
      expect(claimsService.create).toHaveBeenCalledWith(
        createClaimDto,
        mockRequest.user.userId
      );
    });
  });

  describe('findAll', () => {
    it('should return claims filtered by user role', async () => {
      const mockRequest = {
        user: {
          userId: 'user-id',
          role: 'admin',
          tenantId: 'tenant-id',
        },
      };

      const mockClaims = [
        {
          id: 'claim-1',
          identificationNumber: 'C-001',
          status: ClaimStatus.OPEN,
          data: {},
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'claim-2',
          identificationNumber: 'C-002',
          status: ClaimStatus.IN_REVIEW,
          data: {},
          userId: 'user-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClaimsService.findAll.mockResolvedValue(mockClaims);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockClaims);
      expect(claimsService.findAll).toHaveBeenCalledWith({
        userId: mockRequest.user.userId,
        role: mockRequest.user.role,
        tenantId: mockRequest.user.tenantId,
      });
    });
  });

  describe('findOne', () => {
    it('should return a claim by id', async () => {
      const claimId = 'claim-id';
      const mockRequest = {
        user: {
          userId: 'user-id',
          role: 'user',
        },
      };

      const mockClaim = {
        id: claimId,
        identificationNumber: 'C-123',
        status: ClaimStatus.OPEN,
        data: {},
        userId: mockRequest.user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClaimsService.findOne.mockResolvedValue(mockClaim);

      const result = await controller.findOne(claimId, mockRequest);

      expect(result).toEqual(mockClaim);
      expect(claimsService.findOne).toHaveBeenCalledWith(
        claimId,
        mockRequest.user.userId,
        mockRequest.user.role
      );
    });
  });

  describe('update', () => {
    it('should update a claim', async () => {
      const claimId = 'claim-id';
      const updateClaimDto: UpdateClaimDto = {
        status: ClaimStatus.IN_REVIEW,
      };

      const mockRequest = {
        user: {
          userId: 'user-id',
          role: 'admin',
        },
      };

      const mockUpdatedClaim = {
        id: claimId,
        identificationNumber: 'C-123',
        status: ClaimStatus.IN_REVIEW,
        data: {},
        userId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClaimsService.update.mockResolvedValue(mockUpdatedClaim);

      const result = await controller.update(
        claimId,
        updateClaimDto,
        mockRequest
      );

      expect(result).toEqual(mockUpdatedClaim);
      expect(claimsService.update).toHaveBeenCalledWith(
        claimId,
        updateClaimDto,
        mockRequest.user.userId,
        mockRequest.user.role
      );
    });
  });

  describe('remove', () => {
    it('should delete a claim', async () => {
      const claimId = 'claim-id';
      const mockRequest = {
        user: {
          userId: 'user-id',
          role: 'user',
        },
      };

      mockClaimsService.remove.mockResolvedValue(undefined);

      await controller.remove(claimId, mockRequest);

      expect(claimsService.remove).toHaveBeenCalledWith(
        claimId,
        mockRequest.user.userId,
        mockRequest.user.role
      );
    });
  });
});
