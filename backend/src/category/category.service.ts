/* eslint-disable prettier/prettier */

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { Category } from './category.entity';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository:
      Repository<Category>,
  ) {}


  // =====================================
  // GET ALL CATEGORIES
  // =====================================

  async findAll(): Promise<Category[]> {

    return await this.categoryRepository.find({
      order: {
        id: 'DESC',
      },
    });

  }


  // =====================================
  // GET CATEGORY BY ID
  // =====================================

  async findOne(
    id: number,
  ): Promise<Category> {

    const category =
      await this.categoryRepository.findOne({
        where: {
          id,
        },
      });

    if (!category) {

      throw new NotFoundException(
        `Category with ID ${id} not found`,
      );

    }

    return category;

  }


  // =====================================
  // CREATE CATEGORY
  // =====================================

  async create(
    categoryData: {
      name: string;
      description?: string;
      items?: number;
      status?: 'Active' | 'Inactive';
    },
    image?: string,
  ): Promise<Category> {

    const existingCategory =
      await this.categoryRepository.findOne({
        where: {
          name: categoryData.name,
        },
      });

    if (existingCategory) {

      throw new ConflictException(
        'Category already exists',
      );

    }


    const category =
      this.categoryRepository.create({

        name:
          categoryData.name,

        description:
          categoryData.description || null,

        image:
          image || null,

        items:
          categoryData.items ?? 0,

        status:
          categoryData.status || 'Active',

      });


    return await this.categoryRepository.save(
      category,
    );

  }


  // =====================================
  // UPDATE CATEGORY
  // =====================================

  async update(
    id: number,

    categoryData: {
      name?: string;
      description?: string;
      items?: number;
      status?: 'Active' | 'Inactive';
    },

    image?: string,
  ): Promise<Category> {

    const category =
      await this.findOne(id);


    // =================================
    // CHECK DUPLICATE NAME
    // =================================

    if (
      categoryData.name &&
      categoryData.name !== category.name
    ) {

      const existingCategory =
        await this.categoryRepository.findOne({
          where: {
            name: categoryData.name,
          },
        });


      if (
        existingCategory &&
        existingCategory.id !== id
      ) {

        throw new ConflictException(
          'Category already exists',
        );

      }

    }


    // =================================
    // UPDATE NAME
    // =================================

    if (
      categoryData.name !== undefined
    ) {

      category.name =
        categoryData.name;

    }


    // =================================
    // UPDATE DESCRIPTION
    // =================================

    if (
      categoryData.description !== undefined
    ) {

      category.description =
        categoryData.description;

    }


    // =================================
    // UPDATE ITEMS
    // =================================

    if (
      categoryData.items !== undefined
    ) {

      category.items =
        Number(categoryData.items);

    }


    // =================================
    // UPDATE STATUS
    // =================================

    if (
      categoryData.status !== undefined
    ) {

      category.status =
        categoryData.status;

    }


    // =================================
    // UPDATE IMAGE
    // =================================

    if (image) {

      category.image =
        image;

    }


    return await this.categoryRepository.save(
      category,
    );

  }


  // =====================================
  // DELETE CATEGORY
  // =====================================

  async remove(
    id: number,
  ): Promise<{
    message: string;
  }> {

    const category =
      await this.findOne(id);


    await this.categoryRepository.remove(
      category,
    );


    return {
      message:
        'Category deleted successfully',
    };

  }

}