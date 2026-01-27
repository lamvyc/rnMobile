import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { SmsService } from './services/sms.service';
import { EmailService } from './services/email.service';
import { NotificationLog } from './entities/notification-log.entity';
import { UsersModule } from '../users/users.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLog]),
    UsersModule,
    ContactsModule,
  ],
  providers: [NotificationsService, SmsService, EmailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}