import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user_mappings' })
@Index('uq_user_mappings_id1_id2', ['id1', 'id2'], { unique: true })
@Index('uq_user_mappings_user_id', ['userID'], { unique: true })
export class UserMapping {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  id1!: string;

  @Column({ type: 'varchar', length: 255 })
  id2!: string;

  @Column({ type: 'char', length: 36 })
  userID!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
