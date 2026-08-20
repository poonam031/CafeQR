/* eslint-disable prettier/prettier */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';

import { Product } from '../products/product.entity';

@Entity('categories')
export class Category {

  @PrimaryGeneratedColumn()
  id: number;


  // =====================================
  // CATEGORY NAME
  // =====================================

  @Column({
    unique: true,
  })
  name: string;


  // =====================================
  // DESCRIPTION
  // =====================================

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;


  // =====================================
  // IMAGE
  // =====================================

  @Column({
    nullable: true,
  })
  image: string;


  // =====================================
  // NUMBER OF ITEMS
  // =====================================

  @Column({
    type: 'int',
    default: 0,
  })
  items: number;


  // =====================================
  // STATUS
  // =====================================

  @Column({
    type: 'varchar',
    default: 'Active',
  })
  status: 'Active' | 'Inactive';


  // =====================================
  // PRODUCTS
  // =====================================

  @OneToMany(
    () => Product,
    (product) => product.category,
  )
  products: Product[];

}