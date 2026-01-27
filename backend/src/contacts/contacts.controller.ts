import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * POST /contacts - 添加联系人
   */
  @Post()
  async create(@Request() req, @Body() createContactDto: CreateContactDto) {
    const userId = req.user.userId;
    const contact = await this.contactsService.create(userId, createContactDto);
    return {
      message: '联系人添加成功',
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship,
        isVerified: contact.isVerified,
        createdAt: contact.createdAt,
      },
    };
  }

  /**
   * GET /contacts - 查询联系人列表
   */
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId;
    const contacts = await this.contactsService.findAll(userId);
    return {
      contacts: contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship,
        priority: contact.priority,
        isVerified: contact.isVerified,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      })),
      total: contacts.length,
    };
  }

  /**
   * GET /contacts/:id - 查询单个联系人
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    const contact = await this.contactsService.findOne(id, userId);
    return {
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship,
        priority: contact.priority,
        isVerified: contact.isVerified,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    };
  }

  /**
   * PUT /contacts/:id - 更新联系人
   */
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const userId = req.user.userId;
    const contact = await this.contactsService.update(id, userId, updateContactDto);
    return {
      message: '联系人更新成功',
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        relationship: contact.relationship,
        isVerified: contact.isVerified,
        updatedAt: contact.updatedAt,
      },
    };
  }

  /**
   * DELETE /contacts/:id - 删除联系人
   */
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    await this.contactsService.remove(id, userId);
    return {
      message: '联系人删除成功',
    };
  }
}