import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(phone: string, nickname?: string): Promise<User> {
    const user = this.userRepository.create({
      phone,
      nickname: nickname || `用户${phone.slice(-4)}`,
    });
    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async updateLastCheckin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastCheckinAt: new Date(),
    });
  }
}
