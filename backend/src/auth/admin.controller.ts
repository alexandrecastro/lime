import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UpdateAdminService } from './update-admin.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private authService: AuthService,
    private updateAdminService: UpdateAdminService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  @Post('create-admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({
    status: 201,
    description: 'Admin user created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Admin user created successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['admin'] },
            tenantId: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User is already an admin' })
  @ApiBody({ type: CreateUserDto })
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    const { email, password, name, tenantId } = createUserDto;

    if (!email || !password || !name) {
      throw new BadRequestException('Email, password, and name are required');
    }

    try {
      // Check if user already exists
      let user = await this.userRepository.findOne({ where: { email } });

      if (user) {
        // If user exists and is already admin, return conflict
        if (user.role === 'admin') {
          throw new ConflictException('User is already an admin');
        }

        // If user exists, just update their role to admin
        user.role = 'admin' as any;
        if (tenantId) {
          user.tenantId = tenantId;
        }
        const updatedUser = await this.userRepository.save(user);
        const { password: _, ...result } = updatedUser;
        return {
          message: 'User successfully promoted to admin',
          user: result,
        };
      } else {
        // If user doesn't exist, create a new admin user
        const newUser = await this.authService.register(
          email,
          password,
          name,
          tenantId
        );
        newUser.role = 'admin' as any;
        if (tenantId) {
          newUser.tenantId = tenantId;
        }
        const updatedUser = await this.userRepository.save(newUser);
        const { password: _, ...result } = updatedUser;
        return {
          message: 'Admin user created successfully',
          user: result,
        };
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to create admin user: ' + error.message
      );
    }
  }

  @Post('make-admin/:email')
  @ApiOperation({ summary: 'Promote an existing user to admin' })
  @ApiParam({
    name: 'email',
    description: 'Email of the user to promote to admin',
    example: 'user@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully promoted to admin',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string', enum: ['admin'] },
        tenantId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async makeAdmin(@Param('email') email: string) {
    const user = await this.updateAdminService.updateUserToAdmin(email);
    const { password: _, ...result } = user;
    return result;
  }
}
