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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('联系人')
@ApiBearerAuth('JWT-auth')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: '添加联系人', description: '为当前用户添加紧急联系人' })
  @ApiResponse({ status: 201, description: '联系人添加成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
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

  @Get()
  @ApiOperation({ summary: '获取联系人列表', description: '获取当前用户的所有紧急联系人' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
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

  @Get(':id')
  @ApiOperation({ summary: '获取单个联系人', description: '根据 ID 获取联系人详情' })
  @ApiParam({ name: 'id', description: '联系人 ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '联系人不存在' })
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

  @Put(':id')
  @ApiOperation({ summary: '更新联系人', description: '更新指定联系人的信息' })
  @ApiParam({ name: 'id', description: '联系人 ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '联系人不存在' })
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

  @Delete(':id')
  @ApiOperation({ summary: '删除联系人', description: '删除指定的联系人' })
  @ApiParam({ name: 'id', description: '联系人 ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '联系人不存在' })
  async remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    await this.contactsService.remove(id, userId);
    return {
      message: '联系人删除成功',
    };
  }
}
