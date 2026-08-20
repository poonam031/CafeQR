/* eslint-disable prettier/prettier */

import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe
} from '@nestjs/common';

import { CreateOrderDto } from './create-order.dto';

import { OrdersService } from './orders.service';

import { UpdateOrderStatusDto } from './update-order-status.dto';


@Controller('orders')
export class OrdersController {

  constructor(
    private readonly ordersService:
      OrdersService
  ) {}


  // =====================================================
  // CREATE ORDER
  // =====================================================

  @Post()
  create(
    @Body()
    dto: CreateOrderDto
  ) {

    return this.ordersService.create(
      dto
    );

  }


  // =====================================================
  // GET ALL ORDERS
  //
  // Used by:
  // Kitchen Orders
  // History
  // Dashboard
  // =====================================================

  @Get()
  findAll() {

    return this.ordersService.findAll();

  }


  // =====================================================
  // GET ORDERS FOR ONE TABLE
  //
  // Example:
  //
  // GET /orders/table/1
  //
  // Used by Manage Tables page.
  // =====================================================

  @Get('table/:tableId')
  findByTable(

    @Param(
      'tableId',
      ParseIntPipe
    )
    tableId: number

  ) {

    return this.ordersService.findByTable(
      tableId
    );

  }


  // =====================================================
  // GET ONE ORDER
  //
  // Example:
  //
  // GET /orders/5
  // =====================================================

  @Get(':id')
  findOne(

    @Param(
      'id',
      ParseIntPipe
    )
    id: number

  ) {

    return this.ordersService.findOne(
      id
    );

  }


  // =====================================================
  // UPDATE ORDER STATUS
  //
  // Pending
  // Accepted
  // Preparing
  // Served
  // Completed
  // =====================================================

  @Patch(':id/status')
  updateStatus(

    @Param(
      'id',
      ParseIntPipe
    )
    id: number,

    @Body()
    dto: UpdateOrderStatusDto

  ) {

    return this.ordersService.updateStatus(

      id,

      dto.status

    );

  }


  // =====================================================
  // UPDATE PAYMENT
  //
  // Example:
  //
  // PATCH /orders/5/payment
  //
  // {
  //   "paymentMethod": "Cash",
  //   "paymentStatus": "Paid"
  // }
  // =====================================================

  @Patch(':id/payment')
  updatePayment(

    @Param(
      'id',
      ParseIntPipe
    )
    id: number,

    @Body()
    body: {

      paymentMethod:
        | 'Cash'
        | 'Online';

      paymentStatus:
        | 'Paid'
        | 'Pending';

      transactionId?: string;

    }

  ) {

    return this.ordersService.updatePayment(

      id,

      body.paymentMethod,

      body.paymentStatus,

      body.transactionId

    );

  }

}