/* eslint-disable prettier/prettier */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe
} from '@nestjs/common';

import { TablesService } from './tables.service';


@Controller('tables')
export class TablesController {

  constructor(
    private readonly tablesService: TablesService
  ) {}


  // =====================================================
  // GET ALL TABLES
  // =====================================================

  @Get()
  async getAllTables() {

    return await this.tablesService.getAllTables();

  }


  // =====================================================
  // DASHBOARD SUMMARY
  // =====================================================

  @Get('summary')
  async getSummary() {

    return await this.tablesService.getSummary();

  }


  // =====================================================
  // GET ONE TABLE
  //
  // Used by:
  // /table/1
  // /table/2
  // etc.
  // =====================================================

  @Get(':tableNumber')
  async getTable(

    @Param(
      'tableNumber',
      ParseIntPipe
    )
    tableNumber: number

  ) {

    return await this.tablesService.getTable(
      tableNumber
    );

  }


  // =====================================================
  // QR SCAN
  // =====================================================

  @Post(':tableNumber/scan')
  async scanTable(

    @Param(
      'tableNumber',
      ParseIntPipe
    )
    tableNumber: number,

    @Body()
    body?: {
      customerName?: string;
    }

  ) {

    return await this.tablesService.scanTable(

      tableNumber,

      body?.customerName

    );

  }


  // =====================================================
  // FREE TABLE
  // =====================================================

  @Post(':tableNumber/free')
  async freeTable(

    @Param(
      'tableNumber',
      ParseIntPipe
    )
    tableNumber: number

  ) {

    return await this.tablesService.freeTable(
      tableNumber
    );

  }


  // =====================================================
  // CREATE TABLE
  // =====================================================

  @Post()
  async createTable(

    @Body()
    body: {

      tableNumber: number;

      seats: number;

    }

  ) {

    return await this.tablesService.createTable(

      Number(body.tableNumber),

      Number(body.seats)

    );

  }


  // =====================================================
  // UPDATE TABLE / SEATS
  // =====================================================

  @Put(':tableNumber')
  async updateTable(

    @Param(
      'tableNumber',
      ParseIntPipe
    )
    tableNumber: number,

    @Body()
    body: {

      seats: number;

    }

  ) {

    return await this.tablesService.updateTable(

      tableNumber,

      Number(body.seats)

    );

  }


  // =====================================================
  // DELETE TABLE
  // =====================================================

  @Delete(':tableNumber')
  async deleteTable(

    @Param(
      'tableNumber',
      ParseIntPipe
    )
    tableNumber: number

  ) {

    return await this.tablesService.deleteTable(
      tableNumber
    );

  }

}