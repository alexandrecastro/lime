import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClaimStatus } from '../entities/claim.entity';

export class CreateClaimDto {
  @ApiProperty({
    description: 'Claim identification number',
    example: 'C-1234567890-ABC123',
    required: false,
  })
  @IsOptional()
  @IsString()
  identificationNumber?: string;

  @ApiProperty({
    description: 'Claim status',
    enum: ClaimStatus,
    enumName: 'ClaimStatus',
    example: ClaimStatus.OPEN,
    required: false,
  })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiProperty({
    description: 'Claim data as JSON object',
    example: {
      field1: 'value1',
      field2: 'value2',
      amount: 1000,
    },
  })
  @IsObject()
  data: Record<string, any>;
}
