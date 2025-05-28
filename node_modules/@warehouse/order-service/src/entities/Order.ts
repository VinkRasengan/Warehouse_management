import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Order as IOrder, OrderStatus, PaymentStatus, Address } from '@warehouse/types';
import { OrderItem } from './OrderItem';

@Entity('orders')
@Index(['customerId'])
@Index(['status'])
@Index(['orderNumber'], { unique: true })
export class Order implements IOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: Address;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress?: Address;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
