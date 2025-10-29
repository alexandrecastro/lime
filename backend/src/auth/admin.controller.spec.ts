import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminController } from './admin.controller';
import { AuthService } from './auth.service';
import { UpdateAdminService } from './update-admin.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AdminController', () => {
  let controller: AdminController;
  let authService: AuthService;
  let updateAdminService: UpdateAdminService;
  let userRepository: Repository<User>;

  const mockAuthService = {
    register: jest.fn(),
  };

  const mockUpdateAdminService = {
    updateUserToAdmin: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UpdateAdminService,
          useValue: mockUpdateAdminService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    authService = module.get<AuthService>(AuthService);
    updateAdminService = module.get<UpdateAdminService>(UpdateAdminService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAdmin', () => {
    it('should create a new admin user when user does not exist', async () => {
      const createUserDto: CreateUserDto = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        tenantId: 'tenant-id',
      };

      const mockNewUser = {
        id: 'user-id',
        email: 'admin@example.com',
        password: 'hashed-password',
        name: 'Admin User',
        role: 'user',
        tenantId: 'tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockNewUser,
        role: 'admin',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockAuthService.register.mockResolvedValue(mockNewUser);
      mockUserRepository.save.mockResolvedValue(mockUpdatedUser);

      const result = await controller.createAdmin(createUserDto);

      const { password: _, ...userWithoutPassword } = mockUpdatedUser;
      expect(result).toEqual({
        message: 'Admin user created successfully',
        user: userWithoutPassword,
      });
      expect(authService.register).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.password,
        createUserDto.name,
        createUserDto.tenantId
      );
    });

    it('should promote existing user to admin when user exists and is not admin', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@example.com',
        password: 'password123',
        name: 'User',
        tenantId: 'tenant-id',
      };

      const mockExistingUser = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password',
        name: 'User',
        role: 'user',
        tenantId: 'tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPromotedUser = {
        ...mockExistingUser,
        role: 'admin',
      };

      mockUserRepository.findOne.mockResolvedValue(mockExistingUser);
      mockUserRepository.save.mockResolvedValue(mockPromotedUser);

      const result = await controller.createAdmin(createUserDto);

      const { password: _, ...userWithoutPassword } = mockPromotedUser;
      expect(result).toEqual({
        message: 'User successfully promoted to admin',
        user: userWithoutPassword,
      });
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user already exists and is admin', async () => {
      const createUserDto: CreateUserDto = {
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        tenantId: 'tenant-id',
      };

      const mockAdminUser = {
        id: 'user-id',
        email: 'admin@example.com',
        role: 'admin',
        tenantId: 'tenant-id',
      };

      mockUserRepository.findOne.mockResolvedValue(mockAdminUser);

      await expect(controller.createAdmin(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });

    it('should throw BadRequestException when email, password, or name is missing', async () => {
      const createUserDto: CreateUserDto = {
        email: '',
        password: 'password123',
        name: 'User',
        tenantId: 'tenant-id',
      };

      await expect(controller.createAdmin(createUserDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('makeAdmin', () => {
    it('should promote existing user to admin by email', async () => {
      const email = 'user@example.com';
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password',
        name: 'User',
        role: 'admin',
        tenantId: 'tenant-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUpdateAdminService.updateUserToAdmin.mockResolvedValue(mockUser);

      const result = await controller.makeAdmin(email);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(updateAdminService.updateUserToAdmin).toHaveBeenCalledWith(email);
    });
  });
});
