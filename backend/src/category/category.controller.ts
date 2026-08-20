/* eslint-disable prettier/prettier */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  existsSync,
  mkdirSync,
} from 'fs';

import {
  join,
  extname,
} from 'path';

import {
  CategoryService,
} from './category.service';


@Controller('category')
export class CategoryController {

  constructor(
    private readonly categoryService:
      CategoryService,
  ) {}


  // ==========================================
  // GET ALL
  // ==========================================

  @Get()
  async findAll() {

    return await this.categoryService.findAll();

  }


  // ==========================================
  // GET ONE
  // ==========================================

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {

    return await this.categoryService.findOne(
      id,
    );

  }


  // ==========================================
  // CREATE
  // ==========================================

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {

      storage: diskStorage({

        destination: (
          req,
          file,
          callback,
        ) => {

          const uploadPath =
            join(
              process.cwd(),
              'uploads',
              'categories',
            );


          // Create folder if it doesn't exist

          if (
            !existsSync(uploadPath)
          ) {

            mkdirSync(
              uploadPath,
              {
                recursive: true,
              },
            );

          }


          callback(
            null,
            uploadPath,
          );

        },


        filename: (
          req,
          file,
          callback,
        ) => {

          const uniqueName =
            `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(
              file.originalname,
            )}`;

          callback(
            null,
            uniqueName,
          );

        },

      }),


      // =====================================
      // IMAGE TYPE
      // NO SIZE LIMIT
      // =====================================

      fileFilter: (
        req,
        file,
        callback,
      ) => {

        if (
          !file.mimetype.startsWith(
            'image/',
          )
        ) {

          return callback(
            new Error(
              'Only image files are allowed',
            ),
            false,
          );

        }

        callback(
          null,
          true,
        );

      },

    }),
  )
  async create(

    @Body() body: any,

    @UploadedFile()
    file: Express.Multer.File,

  ) {

    console.log(
      'CREATE CATEGORY BODY:',
      body,
    );

    console.log(
      'CREATE CATEGORY FILE:',
      file,
    );


   const categoryData: {
  name: string;
  description?: string;
  items?: number;
  status?: 'Active' | 'Inactive';
} = {

  name: body.name,

  description:
    body.description || undefined,

  items:
    body.items !== undefined
      ? Number(body.items)
      : 0,

  status:
    body.status === 'Inactive'
      ? 'Inactive'
      : 'Active',

};


    const image =
      file
        ? `/uploads/categories/${file.filename}`
        : undefined;


    return await this.categoryService.create(
      categoryData,
      image,
    );

  }


  // ==========================================
  // UPDATE
  // ==========================================

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {

      storage: diskStorage({

        destination: (
          req,
          file,
          callback,
        ) => {

          const uploadPath =
            join(
              process.cwd(),
              'uploads',
              'categories',
            );


          // Create folder if it doesn't exist

          if (
            !existsSync(uploadPath)
          ) {

            mkdirSync(
              uploadPath,
              {
                recursive: true,
              },
            );

          }


          callback(
            null,
            uploadPath,
          );

        },


        filename: (
          req,
          file,
          callback,
        ) => {

          const uniqueName =
            `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(
              file.originalname,
            )}`;

          callback(
            null,
            uniqueName,
          );

        },

      }),


      // =====================================
      // IMAGE TYPE
      // NO SIZE LIMIT
      // =====================================

      fileFilter: (
        req,
        file,
        callback,
      ) => {

        if (
          !file.mimetype.startsWith(
            'image/',
          )
        ) {

          return callback(
            new Error(
              'Only image files are allowed',
            ),
            false,
          );

        }

        callback(
          null,
          true,
        );

      },

    }),
  )
  async update(

    @Param('id', ParseIntPipe)
    id: number,

    @Body() body: any,

    @UploadedFile()
    file: Express.Multer.File,

  ) {

    console.log(
      'UPDATE CATEGORY BODY:',
      body,
    );

    console.log(
      'UPDATE CATEGORY FILE:',
      file,
    );


    const categoryData: any = {};


    // =====================================
    // NAME
    // =====================================

    if (
      body.name !== undefined
    ) {

      categoryData.name =
        body.name;

    }


    // =====================================
    // DESCRIPTION
    // =====================================

    if (
      body.description !== undefined
    ) {

      categoryData.description =
        body.description;

    }


    // =====================================
    // NUMBER OF ITEMS
    // =====================================

    if (
      body.items !== undefined
    ) {

      categoryData.items =
        Number(body.items);

    }


    // =====================================
    // STATUS
    // =====================================

    if (
      body.status !== undefined
    ) {

      categoryData.status =
        body.status === 'Inactive'
          ? 'Inactive'
          : 'Active';

    }


    // =====================================
    // IMAGE
    // =====================================

    const image =
      file
        ? `/uploads/categories/${file.filename}`
        : undefined;


    return await this.categoryService.update(
      id,
      categoryData,
      image,
    );

  }


  // ==========================================
  // DELETE
  // ==========================================

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {

    return await this.categoryService.remove(
      id,
    );

  }

}