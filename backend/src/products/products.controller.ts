/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { ProductsService } from './products.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';


@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // =========================
  // GET ALL PRODUCTS
  // =========================

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return await this.productsService.findAll(
      search,
      categoryId ? Number(categoryId) : undefined,
    );
  }

  // =========================
  // GET ONE PRODUCT
  // =========================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.productsService.findOne(id);
  }

  // =========================
  // CREATE PRODUCT
  // =========================

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new Error(
              'Only image files are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const createProductDto: CreateProductDto = {
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock),
      unit: body.unit || 'Kg',
      categoryId: Number(body.categoryId),
      isAvailable:
        body.isAvailable === undefined
          ? true
          : body.isAvailable === 'true' ||
            body.isAvailable === true,
    };

    const image = file
      ? `/uploads/products/${file.filename}`
      : undefined;

    return await this.productsService.create(
      createProductDto,
      image,
    );
  }

  // =========================
  // UPDATE PRODUCT
  // =========================

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),

      fileFilter: (
        req,
        file,
        callback,
      ) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new Error(
              'Only image files are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updateProductDto: UpdateProductDto = {};

    if (body.name !== undefined) {
      updateProductDto.name = body.name;
    }

    if (body.price !== undefined) {
      updateProductDto.price = Number(body.price);
    }

    if (body.stock !== undefined) {
      updateProductDto.stock = Number(body.stock);
    }

    if (body.unit !== undefined) {
      updateProductDto.unit = body.unit;
    }

    if (body.categoryId !== undefined) {
      updateProductDto.categoryId =
        Number(body.categoryId);
    }

    if (body.isAvailable !== undefined) {
      updateProductDto.isAvailable =
        body.isAvailable === 'true' ||
        body.isAvailable === true;
    }

    const image = file
      ? `/uploads/products/${file.filename}`
      : undefined;

    return await this.productsService.update(
      id,
      updateProductDto,
      image,
    );
  }

  // =========================
  // DELETE PRODUCT
  // =========================

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.productsService.remove(id);
  }

  // =========================
  // UPDATE AVAILABILITY
  // =========================

  @Put(':id/availability')
  async updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return await this.productsService.updateAvailability(
      id,
      isAvailable,
    );
  }
}