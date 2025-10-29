import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          tenantId: 'tenant-id',
          externalId: null,
        },
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-id',
        externalId: 'external-id',
      };

      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
        tenantId: 'tenant-id',
        externalId: 'external-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
        externalId: mockUser.externalId,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(authService.register).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.password,
        createUserDto.name,
        createUserDto.tenantId,
        createUserDto.externalId
      );
    });

    it('should throw BadRequestException when tenantId is missing', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: null,
        externalId: 'external-id',
      };

      await expect(controller.register(createUserDto)).rejects.toThrow(
        BadRequestException
      );
      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const mockUser = {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'user',
        tenantId: 'tenant-id',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});
