import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Claim } from './entities/claim.entity';
import { User } from '../users/entities/user.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createClaimDto: CreateClaimDto, userId: string): Promise<Claim> {
    const identificationNumber =
      createClaimDto.identificationNumber ||
      (await this.generateIdentificationNumber());
    const claim = this.claimRepository.create({
      ...createClaimDto,
      identificationNumber,
      userId,
    });
    return this.claimRepository.save(claim);
  }

  async createForWidget(
    createClaimDto: CreateClaimDto,
    tenantId: string,
    externalUserId: string
  ): Promise<Claim> {
    // Check if user exists with externalId and tenantId
    let user = await this.userRepository.findOne({
      where: { externalId: externalUserId, tenantId },
    });

    if (!user) {
      // Create a new user with random credentials
      const randomEmail = `u-${tenantId}-${externalUserId}@example.com`;
      const randomPassword = '123456'; // Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = this.userRepository.create({
        email: randomEmail,
        password: hashedPassword,
        name: 'External User',
        externalId: externalUserId,
        tenantId,
        role: 'user' as any,
      });
      user = await this.userRepository.save(user);
    }

    const identificationNumber =
      createClaimDto.identificationNumber ||
      (await this.generateIdentificationNumber());

    const claim = this.claimRepository.create({
      ...createClaimDto,
      identificationNumber,
      userId: user.id,
    });

    return this.claimRepository.save(claim);
  }

  async findAll(user: {
    userId: string;
    role: string;
    tenantId: string;
  }): Promise<Claim[]> {
    const query = this.claimRepository
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user');

    if (user.role === 'super_admin') {
      // Super admins can see all claims
      return query.getMany();
    }

    if (user.role === 'admin') {
      // Admins can only see claims from their tenant
      if (user.tenantId) {
        query.andWhere('user.tenantId = :tenantId', {
          tenantId: user.tenantId,
        });
      }
    } else if (user.userId) {
      // Regular users can only see their own claims
      query.where('claim.userId = :userId', { userId: user.userId });
    }

    return query.getMany();
  }

  async findOne(
    id: string,
    userId?: string,
    userRole?: string
  ): Promise<Claim> {
    const query = this.claimRepository
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .where('claim.id = :id', { id });

    if (userRole !== 'admin' && userId) {
      query.andWhere('claim.userId = :userId', { userId });
    }

    const claim = await query.getOne();
    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }
    return claim;
  }

  async update(
    id: string,
    updateClaimDto: UpdateClaimDto,
    userId?: string,
    userRole?: string
  ): Promise<Claim> {
    const claim = await this.findOne(id, userId, userRole);

    // Only admins can change status
    if (
      'status' in updateClaimDto &&
      updateClaimDto.status &&
      userRole !== 'admin'
    ) {
      throw new ForbiddenException('Only admins can change claim status');
    }

    Object.assign(claim, updateClaimDto);
    return this.claimRepository.save(claim);
  }

  async remove(id: string, userId?: string, userRole?: string): Promise<void> {
    const claim = await this.findOne(id, userId, userRole);
    await this.claimRepository.remove(claim);
  }

  async generateIdentificationNumber(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `C-${timestamp}-${random}`;
  }
}
