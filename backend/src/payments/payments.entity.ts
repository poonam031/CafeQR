/* eslint-disable prettier/prettier */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { OrderEntity } from '../orders/order.entity';

@Entity('cafe_payments')
export class PaymentEntity {

  @PrimaryGeneratedColumn()
  id: number;

  // ==========================================
  // ORDER
  // ==========================================

  @OneToOne(() => OrderEntity)
  @JoinColumn()
  order: OrderEntity;


  // ==========================================
  // PAYMENT METHOD
  // ==========================================

  @Column({
    type: 'varchar',
    default: 'UPI',
  })
  method: string;


  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  @Column({
    type: 'varchar',
    default: 'PENDING',
  })
  status:
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'EXPIRED';


  // ==========================================
  // AMOUNT
  // ==========================================

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;


  // ==========================================
  // UNIQUE MERCHANT ORDER ID
  // ==========================================

  @Column({
    type: 'varchar',
    unique: true,
  })
  merchantOrderId: string;


  // ==========================================
  // UPI TRANSACTION ID
  // ==========================================

  @Column({
    type: 'varchar',
    nullable: true,
  })
  transactionId: string;


  // ==========================================
  // BANK TRANSACTION ID
  // ==========================================

  @Column({
    type: 'varchar',
    nullable: true,
  })
  bankTxnId: string;


  // ==========================================
  // PAYMENT MODE
  // ==========================================

  @Column({
    type: 'varchar',
    nullable: true,
  })
  paymentMode: string;


  // ==========================================
  // RESPONSE CODE
  // ==========================================

  @Column({
    type: 'varchar',
    nullable: true,
  })
  responseCode: string;


  // ==========================================
  // RESPONSE MESSAGE
  // ==========================================

  @Column({
    type: 'text',
    nullable: true,
  })
  responseMessage: string;


  // ==========================================
  // PAID TIME
  // ==========================================

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  paidAt: Date;


  // ==========================================
  // EXPIRY TIME
  // ==========================================

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date;


  // ==========================================
  // CREATED
  // ==========================================

  @CreateDateColumn()
  createdAt: Date;


  // ==========================================
  // UPDATED
  // ==========================================

  @UpdateDateColumn()
  updatedAt: Date;
}