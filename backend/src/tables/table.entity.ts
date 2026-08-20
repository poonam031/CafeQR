/* eslint-disable prettier/prettier */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { OrderEntity } from '../orders/order.entity';



@Entity('cafe_tables')
export class TableEntity {

  // =====================================================
  // ID
  // =====================================================

  @PrimaryGeneratedColumn()
  id: number;


  // =====================================================
  // TABLE NUMBER
  // =====================================================

  @Column({
    unique: true
  })
  tableNumber: number;


  // =====================================================
  // SEATS
  // =====================================================

  @Column({
    default: 2
  })
  seats: number;


  // =====================================================
  // STATUS
  // =====================================================

  @Column({
    type: 'varchar',
    default: 'FREE'
  })
  status: 'FREE' | 'BOOKED';


  // =====================================================
  // CUSTOMER
  // =====================================================

  @Column({
    nullable: true
  })
  customerName: string;


  // =====================================================
  // BOOKING TIME
  // =====================================================

  @Column({
    nullable: true
  })
  bookingTime: Date;


  // =====================================================
  // ORDERS
  // =====================================================

  @OneToMany(
    () => OrderEntity,
    order => order.tableId
  )
  orders: OrderEntity[];


  // =====================================================
  // CREATED
  // =====================================================

  @CreateDateColumn()
  createdAt: Date;


  // =====================================================
  // UPDATED
  // =====================================================

  @UpdateDateColumn()
  updatedAt: Date;

}