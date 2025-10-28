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
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post('w')
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
  async create(@Body() createClaimDto: CreateClaimDto, @Request() req) {
    return this.claimsService.create(createClaimDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    const { userId, role, tenantId } = req.user;
    return this.claimsService.findAll({ userId, role, tenantId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.claimsService.findOne(id, req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
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
  remove(@Param('id') id: string, @Request() req) {
    return this.claimsService.remove(id, req.user.userId, req.user.role);
  }
}
