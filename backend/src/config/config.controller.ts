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
import { AppConfig, ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('w')
  async getConfigForWidget(@Headers('API-Key') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Oops... API-Key header is required.');
    }
    return await this.configService.getConfig(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getConfig(@Request() req) {
    const tenantId = req.user.tenantId;
    return await this.configService.getConfig(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('claim-form')
  async getClaimFormSteps(@Request() req) {
    const tenantId = req.user.tenantId;
    return await this.configService.getClaimFormStepsAsync(tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async updateConfig(@Body() config: AppConfig, @Request() req) {
    const tenantId = req.user.tenantId;
    await this.configService.updateConfig(config, tenantId);
    return { message: 'Configuration updated successfully' };
  }
}
