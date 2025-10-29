import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Authentication fields
  @Column({ unique: true, length: 50 })
  username: string;

  @Column()
  passwordHash: string;

  // Profile fields (for friend system and other features)
  @Column({ nullable: true, length: 100 })
  displayName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: 1 })
  level: number;

  // Status fields
  @Column({ default: 'offline', length: 20 })
  onlineStatus: string;

  @Column({ nullable: true })
  lastOnlineAt?: Date;

  // Privacy settings
  @Column({
    type: 'jsonb',
    default: {
      allowFriendRequests: true,
      showOnlineStatus: true,
      showLevel: true,
    },
  })
  privacySettings: {
    allowFriendRequests: boolean;
    showOnlineStatus: boolean;
    showLevel: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
