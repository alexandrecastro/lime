import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UpdateAdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async updateUserToAdmin(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    user.role = 'admin' as any;
    return this.userRepository.save(user);
  }
}
