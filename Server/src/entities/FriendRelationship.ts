import { Entity, PrimaryColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { IsNotEmpty, IsUUID, IsDate } from 'class-validator';
import { InGameAccount } from './InGameAccount';

@Entity('friend_relationships')
@Unique(['accountId1', 'accountId2'])
export class FriendRelationship {
    @PrimaryColumn({ name: 'relationship_id', length: 36 })
    @IsUUID('4')
    @IsNotEmpty()
    relationshipId: string;

    @Column({ name: 'account_id1', length: 36 })
    @Index()
    @IsUUID('4')
    @IsNotEmpty()
    accountId1: string;

    @Column({ name: 'account_id2', length: 36 })
    @Index()
    @IsUUID('4')
    @IsNotEmpty()
    accountId2: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => InGameAccount, { eager: false })
    @JoinColumn({ name: 'account_id1' })
    account1: InGameAccount;

    @ManyToOne(() => InGameAccount, { eager: false })
    @JoinColumn({ name: 'account_id2' })
    account2: InGameAccount;
}
