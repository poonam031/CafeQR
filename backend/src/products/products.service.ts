/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { CreateProductDto } from './create-product.dto';
import { Product } from './product.entity';
import { UpdateProductDto } from './update-product.dto';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // =========================
  // CREATE PRODUCT
  // =========================

  async create(
    createProductDto: CreateProductDto,
    image?: string,
  ): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      image: image || null,
    });

    return await this.productRepository.save(product);
  }

  // =========================
  // GET ALL PRODUCTS
  // =========================

  async findAll(
    search?: string,
    categoryId?: number,
  ): Promise<Product[]> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        'LOWER(product.name) LIKE LOWER(:search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (categoryId) {
      query.andWhere(
        'product.categoryId = :categoryId',
        {
          categoryId,
        },
      );
    }

    return await query.getMany();
  }

  // =========================
  // GET ONE PRODUCT
  // =========================

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${id} not found`,
      );
    }

    return product;
  }

  // =========================
  // UPDATE PRODUCT
  // =========================

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    image?: string,
  ): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    if (image) {
      product.image = image;
    }

    return await this.productRepository.save(product);
  }

  // =========================
  // DELETE PRODUCT
  // =========================

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);

    return {
      message: 'Product deleted successfully',
    };
  }

  // =========================
  // UPDATE AVAILABILITY
  // =========================

  async updateAvailability(
    id: number,
    isAvailable: boolean,
  ): Promise<Product> {
    const product = await this.findOne(id);

    product.isAvailable = isAvailable;

    return await this.productRepository.save(product);
  }
}