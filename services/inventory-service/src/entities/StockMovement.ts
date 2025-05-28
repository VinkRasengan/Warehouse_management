import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { StockMovement as IStockMovement } from '@warehouse/types';

@Entity('stock_movements')
@Index(['productId'])
@Index(['type'])
@Index(['createdAt'])
export class StockMovement implements IStockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'enum', enum: ['IN', 'OUT', 'ADJUSTMENT'] })
  type: 'IN' | 'OUT' | 'ADJUSTMENT';

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference?: string;

  @Column({ type: 'varchar', length: 255 })
  performedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
