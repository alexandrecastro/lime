import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('claims')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post('w')
  @ApiOperation({ summary: 'Create claim for widget (public endpoint)' })
  @ApiHeader({
    name: 'API-Key',
    description: 'Tenant API Key',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiHeader({
    name: 'User-ID',
    description: 'External user ID',
    required: true,
    example: 'ext-user-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Claim created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'API-Key or User-ID header is required',
  })
  @ApiBody({ type: CreateClaimDto })
  async createForWidget(
    @Headers('API-Key') tenantId: string,
    @Headers('User-ID') externalUserId: string,
    @Body() createClaimDto: CreateClaimDto
  ) {
    if (!tenantId) {
      throw new BadRequestException('Oops... API-Key header is required.');
    }
    if (!externalUserId) {
      throw new BadRequestException('Oops... User-ID header is required.');
    }
    return this.claimsService.createForWidget(
      createClaimDto,
      tenantId,
      externalUserId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new claim' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Claim created successfully',
  })
  @ApiBody({ type: CreateClaimDto })
  async create(@Body() createClaimDto: CreateClaimDto, @Request() req) {
    return this.claimsService.create(createClaimDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all claims (filtered by user role and tenant)' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'List of claims',
    isArray: true,
  })
  findAll(@Request() req) {
    const { userId, role, tenantId } = req.user;
    return this.claimsService.findAll({ userId, role, tenantId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get claim by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Claim ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim found',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.claimsService.findOne(id, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update claim by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Claim ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  @ApiBody({ type: UpdateClaimDto })
  update(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
    @Request() req
  ) {
    return this.claimsService.update(
      id,
      updateClaimDto,
      req.user.userId,
      req.user.role
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete claim by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Claim ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.claimsService.remove(id, req.user.userId, req.user.role);
  }
}
