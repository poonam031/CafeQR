/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../category/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 150,
  })
  name: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  stock: number;

  @Column({
    length: 50,
    default: 'Kg',
  })
  unit: string;

  @Column({
    nullable: true,
  })
  image: string;

  @Column({
    default: true,
  })
  isAvailable: boolean;

  @Column({
    nullable: true,
  })
  categoryId: number;

  @ManyToOne(
    () => Category,
    (category) => category.products,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'categoryId',
  })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}