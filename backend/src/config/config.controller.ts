import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AppConfig, ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('w')
  @ApiOperation({ summary: 'Get configuration for widget (public endpoint)' })
  @ApiHeader({
    name: 'API-Key',
    description: 'Tenant API Key',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '1.0.0' },
        color: { type: 'string', example: 'teal' },
        abTest: {
          type: 'object',
          properties: {
            fileUploadMethod: {
              type: 'string',
              enum: ['drag-drop', 'dialog'],
              example: 'drag-drop',
            },
          },
        },
        claimForm: {
          type: 'object',
          properties: {
            steps: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'API-Key header is required',
  })
  async getConfigForWidget(@Headers('API-Key') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Oops... API-Key header is required.');
    }
    return await this.configService.getConfig(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get configuration for current tenant' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '1.0.0' },
        color: { type: 'string', example: 'teal' },
        abTest: {
          type: 'object',
          properties: {
            fileUploadMethod: {
              type: 'string',
              enum: ['drag-drop', 'dialog'],
              example: 'drag-drop',
            },
          },
        },
        claimForm: {
          type: 'object',
          properties: {
            steps: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  async getConfig(@Request() req) {
    const tenantId = req.user.tenantId;
    return await this.configService.getConfig(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('claim-form')
  @ApiOperation({ summary: 'Get claim form steps configuration' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Claim form steps retrieved successfully',
    isArray: true,
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          order: { type: 'number' },
          fields: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  })
  async getClaimFormSteps(@Request() req) {
    const tenantId = req.user.tenantId;
    return await this.configService.getClaimFormStepsAsync(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Update configuration for current tenant' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Configuration updated successfully' },
      },
    },
  })
  @ApiBody({
    description: 'Configuration object',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '1.0.0' },
        color: { type: 'string', example: 'teal' },
        abTest: {
          type: 'object',
          properties: {
            fileUploadMethod: {
              type: 'string',
              enum: ['drag-drop', 'dialog'],
              example: 'drag-drop',
            },
          },
        },
        claimForm: {
          type: 'object',
          properties: {
            steps: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  async updateConfig(@Body() config: AppConfig, @Request() req) {
    const tenantId = req.user.tenantId;
    await this.configService.updateConfig(config, tenantId);
    return { message: 'Configuration updated successfully' };
  }
}
