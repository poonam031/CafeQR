/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';

import {
  FileInterceptor
} from '@nestjs/platform-express';

import {
  diskStorage
} from 'multer';

import {
  extname
} from 'path';

import { MenuService } from './menu.service';

import { CreateMenuDto } from './create-menu.dto';


@Controller('menu')
export class MenuController {

  constructor(
    private readonly menuService: MenuService
  ) {}


  // =========================================
  // CREATE MENU ITEM
  // =========================================

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {

      storage: diskStorage({

        destination:
          './uploads/menu',

        filename: (
          req,
          file,
          callback
        ) => {

          const uniqueName =
            `${Date.now()}-${Math.round(
              Math.random() * 1E9
            )}${extname(file.originalname)}`;

          callback(
            null,
            uniqueName
          );

        }

      })

    })
  )
  create(
    @UploadedFile() file: Express.Multer.File,

    @Body() dto: CreateMenuDto
  ) {

    if (file) {

      dto.image =
        `/uploads/menu/${file.filename}`;

    }

    return this.menuService.create(dto);

  }


  // =========================================
  // GET ALL
  // =========================================

  @Get()
  findAll() {

    return this.menuService.findAll();

  }


  // =========================================
  // GET ONE
  // =========================================

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {

    return this.menuService.findOne(
      +id
    );

  }


  // =========================================
  // UPDATE
  // =========================================

  @Patch(':id')
  update(
    @Param('id') id: string,

    @Body() dto: Partial<CreateMenuDto>
  ) {

    return this.menuService.update(
      +id,
      dto
    );

  }


  // =========================================
  // DELETE
  // =========================================

  @Delete(':id')
  remove(
    @Param('id') id: string
  ) {

    return this.menuService.remove(
      +id
    );

  }

}