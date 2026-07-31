/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Order {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tableId: number;

  @Column('json')
  items: any[];

  @Column()
  total: number;

  @Column({
    default: 'Pending'
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}