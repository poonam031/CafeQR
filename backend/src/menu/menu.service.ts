/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';

import {
  InjectRepository
} from '@nestjs/typeorm';

import {
  Repository
} from 'typeorm';

import { Menu } from './menu.entity';

import { CreateMenuDto } from './create-menu.dto';


@Injectable()
export class MenuService {

  constructor(

    @InjectRepository(Menu)

    private readonly menuRepository:
      Repository<Menu>

  ) {}


  // =========================================
  // CREATE
  // =========================================

  async create(
    dto: CreateMenuDto
  ) {

    const menu =
      this.menuRepository.create(dto);

    return this.menuRepository.save(menu);

  }


  // =========================================
  // GET ALL
  // =========================================

  async findAll() {

    return this.menuRepository.find({

      order: {
        createdAt: 'DESC'
      }

    });

  }


  // =========================================
  // GET ONE
  // =========================================

  async findOne(id: number) {

    return this.menuRepository.findOne({

      where: {
        id
      }

    });

  }


  // =========================================
  // UPDATE
  // =========================================

  async update(
    id: number,
    dto: Partial<CreateMenuDto>
  ) {

    await this.menuRepository.update(
      id,
      dto
    );

    return this.findOne(id);

  }


  // =========================================
  // DELETE
  // =========================================

  async remove(id: number) {

    await this.menuRepository.delete(id);

    return {
      message: 'Menu item deleted successfully'
    };

  }

}