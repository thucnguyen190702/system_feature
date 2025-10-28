import { Entity, PrimaryColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsNotEmpty, IsOptional, Length, IsUUID } from 'class-validator';
import { InGameAccount } from './InGameAccount';

@Entity('blocked_accounts')
@Index(['blockerAccountId', 'blockedAccountId'], { unique: true })
export class BlockedAccount {
    @PrimaryColumn({ name: 'block_id', length: 36 })
    @IsUUID('4')
    @IsNotEmpty()
    blockId: string;
    
    @Column({ name: 'blocker_account_id', length: 36 })
    @Index()
    @IsUUID('4')
    @IsNotEmpty()
    blockerAccountId: string;
    
    @Column({ name: 'blocked_account_id', length: 36 })
    @Index()
    @IsUUID('4')
    @IsNotEmpty()
    blockedAccountId: string;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    @IsOptional()
    @IsString()
    @Length(0, 255)
    reason: string | null;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => InGameAccount)
    @JoinColumn({ name: 'blocker_account_id' })
    blockerAccount: InGameAccount;

    @ManyToOne(() => InGameAccount)
    @JoinColumn({ name: 'blocked_account_id' })
    blockedAccount: InGameAccount;
}
