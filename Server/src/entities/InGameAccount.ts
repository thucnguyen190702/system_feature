import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IsString, IsNotEmpty, Length, IsOptional, IsInt, Min, IsBoolean, IsIn, IsUUID, IsUrl, IsDate } from 'class-validator';

@Entity('accounts')
export class InGameAccount {
    @PrimaryColumn({ name: 'account_id', length: 36 })
    @IsUUID('4')
    @IsNotEmpty()
    accountId: string;

    @Column({ unique: true, length: 50 })
    @Index()
    @IsString()
    @IsNotEmpty()
    @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
    username: string;

    @Column({ name: 'display_name', length: 100 })
    @IsString()
    @IsNotEmpty()
    @Length(1, 100, { message: 'Display name must be between 1 and 100 characters' })
    displayName: string;

    @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
    @Length(0, 255)
    avatarUrl: string | null;

    @Column({ default: 1 })
    @IsInt()
    @Min(1, { message: 'Level must be at least 1' })
    level: number;

    @Column({ length: 20, default: 'active' })
    @Index()
    @IsString()
    @IsIn(['active', 'inactive', 'banned'], { message: 'Status must be active, inactive, or banned' })
    status: string;

    @Column({ name: 'is_online', default: false })
    @Index()
    @IsBoolean()
    isOnline: boolean;

    @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate()
    lastSeenAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
