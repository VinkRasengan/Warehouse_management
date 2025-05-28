import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { InventoryItem as IInventoryItem } from '@warehouse/types';

@Entity('inventory_items')
@Index(['productId'], { unique: true })
export class InventoryItem implements IInventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  minThreshold: number;

  @Column({ type: 'integer', nullable: true })
  maxThreshold?: number;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
