import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './entities/config.entity';

export interface FieldConfig {
  id: string;
  type: 'STRING' | 'NUMBER' | 'AMOUNT' | 'DATE' | 'BOOLEAN' | 'FILE' | 'LIST';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  order?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  order?: number;
  fields: FieldConfig[];
}

export interface AppConfig {
  version: string;
  color: string;
  abTest: {
    fileUploadMethod: 'drag-drop' | 'dialog';
  };
  claimForm: {
    steps: StepConfig[];
  };
}

@Injectable()
export class ConfigService implements OnModuleInit {
  private config: AppConfig;

  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>
  ) {}

  async onModuleInit() {
    // Load initial config from database for default tenant
    // This will be called with tenantId from the controller
  }

  private async loadConfigFromDatabase(tenantId: string) {
    const configRecord = await this.configRepository.findOne({
      where: { tenantId },
    });

    if (configRecord) {
      this.config = JSON.parse(configRecord.data);
    } else {
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): AppConfig {
    return {
      version: '1.0.0',
      color: 'teal',
      abTest: {
        fileUploadMethod: 'drag-drop',
      },
      claimForm: {
        steps: [],
      },
    };
  }

  async loadConfigFromFile(tenantId: string) {
    const configPath = path.join(process.cwd(), 'app-config.json');
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      this.config = JSON.parse(configData);
      // Save to database
      await this.saveConfigToDatabase(tenantId);
    } catch (error) {
      console.error('Error loading config from file: ', error);
      this.config = this.getDefaultConfig();
    }
  }

  private async saveConfigToDatabase(tenantId: string) {
    let configRecord = await this.configRepository.findOne({
      where: { tenantId },
    });

    if (!configRecord) {
      configRecord = this.configRepository.create({
        id: 'main',
        tenantId,
        data: JSON.stringify(this.config),
      });
    } else {
      configRecord.data = JSON.stringify(this.config);
    }

    await this.configRepository.save(configRecord);
  }

  getClaimFormSteps(tenantId: string): StepConfig[] {
    return this.config.claimForm.steps;
  }

  async getClaimFormStepsAsync(tenantId: string): Promise<StepConfig[]> {
    await this.loadConfigFromDatabase(tenantId);
    return this.config.claimForm.steps;
  }

  async getConfig(tenantId: string): Promise<AppConfig> {
    await this.loadConfigFromDatabase(tenantId);
    return this.config;
  }

  async updateConfig(newConfig: AppConfig, tenantId: string): Promise<void> {
    this.config = newConfig;
    await this.saveConfigToDatabase(tenantId);
  }
}
