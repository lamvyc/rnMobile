import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('checkins')
@Index(['userId', 'checkinDate'], { unique: true })
export class Checkin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date', comment: '签到日期 (YYYY-MM-DD)' })
  checkinDate: string;

  @Column({ type: 'timestamp', comment: '签到时间' })
  checkinTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
