/* eslint-disable prettier/prettier */

import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';

import {
  InjectRepository
} from '@nestjs/typeorm';

import {
  Repository
} from 'typeorm';

import { TableEntity } from './table.entity';


@Injectable()
export class TablesService {

  constructor(

    @InjectRepository(TableEntity)

    private readonly tableRepository:
      Repository<TableEntity>

  ) {}


  // =====================================================
  // GET ALL TABLES
  //
  // Dashboard uses this.
  //
  // Dashboard only needs:
  // Table Number
  // Seats
  // FREE / BOOKED
  // =====================================================

  async getAllTables() {

    return await this.tableRepository.find({

      order: {
        tableNumber: 'ASC'
      }

    });

  }


  // =====================================================
  // GET ONE TABLE
  //
  // Table details page.
  //
  // Order/payment details are loaded separately
  // from the Orders module.
  // =====================================================

  async getTable(
    tableNumber: number
  ) {

    const table =
      await this.tableRepository.findOne({

        where: {
          tableNumber
        }

      });


    if (!table) {

      throw new NotFoundException(

        `Table ${tableNumber} not found`

      );

    }


    return table;

  }


  // =====================================================
  // QR SCAN
  // =====================================================

  async scanTable(

    tableNumber: number,

    customerName?: string

  ) {

    const table =
      await this.getTable(
        tableNumber
      );


    // ---------------------------------------------------
    // ALREADY BOOKED
    // ---------------------------------------------------

    if (
      table.status === 'BOOKED'
    ) {

      return {

        success: true,

        alreadyBooked: true,

        message:
          `Table ${tableNumber} is already booked`,

        table

      };

    }


    // ---------------------------------------------------
    // BOOK TABLE
    // ---------------------------------------------------

    table.status =
      'BOOKED';


    table.bookingTime =
      new Date();


    table.customerName =
      customerName?.trim() ||
      'QR Customer';


    const savedTable =
      await this.tableRepository.save(
        table
      );


    return {

      success: true,

      alreadyBooked: false,

      message:
        `Table ${tableNumber} booked successfully`,

      table: savedTable

    };

  }


  // =====================================================
  // FREE TABLE
  // =====================================================

  async freeTable(
    tableNumber: number
  ) {

    const table =
      await this.getTable(
        tableNumber
      );


    table.status =
      'FREE';


    table.customerName =
      null;


    table.bookingTime =
      null;


    const savedTable =
      await this.tableRepository.save(
        table
      );


    return {

      success: true,

      message:
        `Table ${tableNumber} is now free`,

      table:
        savedTable

    };

  }


  // =====================================================
  // CREATE TABLE
  // =====================================================

  async createTable(

    tableNumber: number,

    seats: number

  ) {


    if (
      !tableNumber ||
      tableNumber < 1
    ) {

      throw new BadRequestException(
        'Invalid table number'
      );

    }


    if (
      !seats ||
      seats < 1
    ) {

      throw new BadRequestException(
        'Seats must be at least 1'
      );

    }


    const existing =
      await this.tableRepository.findOne({

        where: {
          tableNumber
        }

      });


    if (existing) {

      throw new BadRequestException(

        `Table ${tableNumber} already exists`

      );

    }


    const table =
      this.tableRepository.create({

        tableNumber,

        seats,

        status: 'FREE',

        customerName: null,

        bookingTime: null

      });


    return await this.tableRepository.save(
      table
    );

  }


  // =====================================================
  // UPDATE TABLE
  // =====================================================

  async updateTable(

    tableNumber: number,

    seats: number

  ) {

    const table =
      await this.getTable(
        tableNumber
      );


    if (
      !seats ||
      seats < 1
    ) {

      throw new BadRequestException(
        'Seats must be at least 1'
      );

    }


    table.seats =
      seats;


    return await this.tableRepository.save(
      table
    );

  }


  // =====================================================
  // DELETE TABLE
  // =====================================================

  async deleteTable(
    tableNumber: number
  ) {

    const table =
      await this.getTable(
        tableNumber
      );


    if (
      table.status === 'BOOKED'
    ) {

      throw new BadRequestException(

        'Cannot remove a booked table'

      );

    }


    await this.tableRepository.remove(
      table
    );


    return {

      success: true,

      message:
        `Table ${tableNumber} removed successfully`

    };

  }


  // =====================================================
  // DASHBOARD SUMMARY
  // =====================================================

  async getSummary() {

    const total =
      await this.tableRepository.count();


    const booked =
      await this.tableRepository.count({

        where: {
          status: 'BOOKED'
        }

      });


    const free =
      await this.tableRepository.count({

        where: {
          status: 'FREE'
        }

      });


    return {

      total,

      booked,

      free

    };

  }

}