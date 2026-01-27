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

// 把类标记成数据库表
@Entity('checkins')
// 定义一个复合索引，用于唯一约束 userId 和 checkinDate 的组合(唯一约束检查的是 组合值是否完全相同,不完全相同报错)
@Index(['userId', 'checkinDate'], { unique: true })
export class Checkin {
  // 主键叫 id，值是 UUID。
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 字段名 = userId，字段类型 = uuid
  @Column({ type: 'uuid' })
  userId: string;

  // userId 是数据库字段 user 是 ORM 关系字段 @JoinColumn 指定外键名 @ManyToOne 指定关系类型
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // 纯日期|字段名是 checkinDate，字段类型是 date，comment 只是注释，不影响任何逻辑。
  @Column({ type: 'date', comment: '签到日期 (YYYY-MM-DD)' })
  checkinDate: string;

  // 精确时间点|格式YYYY-MM-DD HH:mm:ss
  @Column({ type: 'timestamp', comment: '签到时间' })
  checkinTime: Date;

  // 自动维护的时间戳|会自动补-记录写入数据库时间
  @CreateDateColumn()
  createdAt: Date;
}

/*
主键 = 表内部的唯一身份
外键 = 跨表的关联关系|关联其他表

| 比较项  | 主键       | 外键             |
| ---- | -------- | -------------- |
| 用途   | 唯一识别记录   | 关联其他表          |
| 唯一性  | 必须唯一     | 可以重复           |
| 可否为空 | 不能为 NULL | 可以为 NULL（取决设计） |
| 约束来源 | 本表       | 别的表            |
| 样例   | `id`     | `userId`       |

外键保证数据一致性，但牺牲性能和系统扩展性

在自己的表里是外键
用该外键与其关联的表是它的主键吗

答案是：
是的 —— 外键指向对方表的主键（或唯一键）
绝大多数情况下指向主键

虽然 通常指向主键，但 SQL 允许外键指向：
主键（Primary Key）
或唯一键（UNIQUE）

在自己的表里，userId 是外键； 在用户表中，id 是主键； 两者值必须对应同一个用户， 但是否强制由数据库保证取决于是否建外键。

强制=>
✔ 拦截插入
✔ 拦截更新
✔ 拦截删除
✔ 保证 referential integrity（参照完整性）
*/
