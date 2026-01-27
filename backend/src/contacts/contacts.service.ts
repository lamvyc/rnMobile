import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  /**
   * 添加联系人
   * 限制：每个用户最多3个联系人
   */
  async create(userId: string, createContactDto: CreateContactDto): Promise<Contact> {
    // 检查是否已存在联系人
    const existingCount = await this.contactRepository.count({
      where: { userId },
    });

    if (existingCount >= 3) {
      throw new BadRequestException('每个用户最多只能添加3个紧急联系人');
    }

    // 动态分配优先级：按添加顺序递增
    const nextPriority = existingCount + 1;

    // 创建联系人
    const contact = this.contactRepository.create({
      userId,
      ...createContactDto,
      priority: nextPriority,
    });

    return await this.contactRepository.save(contact);
  }

  /**
   * 查询用户的所有联系人
   */
  async findAll(userId: string): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { userId },
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 查询单个联系人
   */
  async findOne(id: string, userId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, userId },
    });

    if (!contact) {
      throw new NotFoundException('联系人不存在');
    }

    return contact;
  }

  /**
   * 更新联系人信息
   */
  async update(id: string, userId: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id, userId);

    // 更新字段
    Object.assign(contact, updateContactDto);

    return await this.contactRepository.save(contact);
  }

  /**
   * 删除联系人
   */
  async remove(id: string, userId: string): Promise<void> {
    const contact = await this.findOne(id, userId);
    await this.contactRepository.remove(contact);
  }

  /**
   * 查询用户的第一个联系人（优先级最高）
   * 用于通知服务
   */
  async findPrimaryContact(userId: string): Promise<Contact | null> {
    return await this.contactRepository.findOne({
      where: { userId },
      order: { priority: 'ASC', createdAt: 'ASC' },
    });
  }
}
