import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Acme Corporation',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tenant logo (base64 encoded image)',
    example: 'data:image/png;base64,iVBORw0KGgo...',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;
}
