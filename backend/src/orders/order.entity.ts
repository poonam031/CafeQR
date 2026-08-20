/* eslint-disable prettier/prettier */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';


@Entity('orders')
export class OrderEntity {


  // ==========================================
  // ID
  // ==========================================

  @PrimaryGeneratedColumn()
  id: number;


  // ==========================================
  // TABLE ID
  // ==========================================

  @Column()
  tableId: number;


  // ==========================================
  // CUSTOMER
  // ==========================================

  @Column({
    nullable: true,
  })
  customerName: string;


  // ==========================================
  // ORDER ITEMS
  // ==========================================

  @Column({
    type: 'jsonb',
  })
  items: any[];


  // ==========================================
  // TOTAL
  // ==========================================

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: number;


  // ==========================================
  // PAYMENT METHOD
  // ==========================================

  @Column({
    type: 'varchar',
    default: 'Cash',
  })
  paymentMethod: 'Cash' | 'Online';


  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  @Column({
    type: 'varchar',
    default: 'Pending',
  })
  paymentStatus: 'Paid' | 'Pending';


  // ==========================================
  // ORDER STATUS
  // ==========================================

  @Column({
    type: 'varchar',
    default: 'Pending',
  })
  status:
    | 'Pending'
    | 'Accepted'
    | 'Preparing'
    | 'Served'
    | 'Completed';


  // ==========================================
  // TRANSACTION ID
  // ==========================================

  @Column({
    nullable: true,
  })
  transactionId: string;


  // ==========================================
  // PAID AT
  // ==========================================

  @Column({
    nullable: true,
  })
  paidAt: Date;


  // ==========================================
  // CREATED AT
  // ==========================================

  @CreateDateColumn()
  createdAt: Date;


  // ==========================================
  // UPDATED AT
  // ==========================================

  @UpdateDateColumn()
  updatedAt: Date;


  // ==========================================
  // RAZORPAY QR ID
  // ==========================================

  @Column({
    type: 'varchar',
    nullable: true,
  })
  razorpayQrId: string | null;


  // ==========================================
  // RAZORPAY QR IMAGE URL
  // ==========================================

  @Column({
    type: 'text',
    nullable: true,
  })
  razorpayQrImageUrl: string | null;


  // ==========================================
  // RAZORPAY PAYMENT ID
  // ==========================================

  @Column({
    type: 'varchar',
    nullable: true,
  })
  razorpayPaymentId: string | null;


  // ==========================================
  // RAZORPAY ORDER ID
  // REQUIRED FOR STANDARD CHECKOUT
  // ==========================================

  @Column({
    type: 'varchar',
    nullable: true,
  })
  razorpayOrderId: string | null;

}