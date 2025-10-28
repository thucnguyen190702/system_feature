import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsNotEmpty, IsIn, IsUUID, IsDate } from 'class-validator';
import { InGameAccount } from './InGameAccount';

@Entity('friend_requests')
export class FriendRequest {
    @PrimaryColumn({ name: 'request_id', length: 36 })
    @IsUUID('4')
    @IsNotEmpty()
    requestId: string;
    
    @Column({ name: 'from_account_id', length: 36 })
    @Index()
    @IsUUID('4')
    @IsNotEmpty()
    fromAccountId: string;
    
    @Column({ name: 'to_account_id', length: 36 })
    @Index()
    @IsUUID('4')
    @IsNotEmpty()
    toAccountId: string;
    
    @Column({ length: 20, default: 'pending' })
    @Index()
    @IsString()
    @IsIn(['pending', 'accepted', 'rejected'], { message: 'Status must be pending, accepted, or rejected' })
    status: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
    
    @ManyToOne(() => InGameAccount, { eager: false })
    @JoinColumn({ name: 'from_account_id' })
    fromAccount: InGameAccount;
    
    @ManyToOne(() => InGameAccount, { eager: false })
    @JoinColumn({ name: 'to_account_id' })
    toAccount: InGameAccount;
}
