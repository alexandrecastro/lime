import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ClaimStatus } from '../entities/claim.entity';

export class CreateClaimDto {
  @IsOptional()
  @IsString()
  identificationNumber?: string;

  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsObject()
  data: Record<string, any>;
}
