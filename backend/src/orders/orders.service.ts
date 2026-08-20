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
  OrderEntity
} from './order.entity';

import {
  Repository
} from 'typeorm';

import {
  CreateOrderDto
} from './create-order.dto';

import {
  OrdersGateway
} from './orders.gateway';


@Injectable()
export class OrdersService {

  constructor(

    @InjectRepository(OrderEntity)

    private orderRepository:
      Repository<OrderEntity>,


    private ordersGateway:
      OrdersGateway

  ) {}


  // =====================================================
  // CREATE ORDER
  // =====================================================

  async create(
    dto: CreateOrderDto
  ) {


    // ---------------------------------------------------
    // VALIDATE TABLE
    // ---------------------------------------------------

    if (
      !dto.tableId ||
      Number(dto.tableId) < 1
    ) {

      throw new BadRequestException(
        'Valid tableId is required'
      );

    }


    // ---------------------------------------------------
    // VALIDATE ITEMS
    // ---------------------------------------------------

    if (
      !dto.items ||
      !Array.isArray(dto.items) ||
      dto.items.length === 0
    ) {

      throw new BadRequestException(
        'Order must contain at least one item'
      );

    }


    // ---------------------------------------------------
    // VALIDATE PAYMENT METHOD
    // ---------------------------------------------------

    if (
      dto.paymentMethod !== 'Cash' &&
      dto.paymentMethod !== 'Online'
    ) {

      throw new BadRequestException(

        'Payment method must be Cash or Online'

      );

    }


    // ---------------------------------------------------
    // CALCULATE TOTAL FROM ITEMS
    // ---------------------------------------------------

    let calculatedTotal = 0;


    const processedItems =
      dto.items.map(
        (item: any) => {


          const price =
            Number(item.price);


          const quantity =
            Number(item.quantity);


          if (
            !item.name &&
            !item.menuItemName
          ) {

            throw new BadRequestException(

              'Every order item must have a name'

            );

          }


          if (
            !price ||
            price < 0
          ) {

            throw new BadRequestException(

              'Invalid item price'

            );

          }


          if (
            !quantity ||
            quantity < 1
          ) {

            throw new BadRequestException(

              'Invalid item quantity'

            );

          }


          const itemTotal =
            price * quantity;


          calculatedTotal +=
            itemTotal;


          return {

            menuItemId:
              item.menuItemId ||
              item.id ||
              null,

            name:
              item.name ||
              item.menuItemName,

            price,

            quantity,

            total:
              itemTotal

          };

        }

      );


    // ---------------------------------------------------
    // PAYMENT STATUS
    // ---------------------------------------------------

    const paymentStatus =
      dto.paymentStatus === 'Paid'
        ? 'Paid'
        : 'Pending';


    // ---------------------------------------------------
    // CREATE ORDER
    // ---------------------------------------------------

    const order =
      this.orderRepository.create({

        tableId:
          Number(dto.tableId),

        customerName:
          dto.customerName ||
          'QR Customer',

        items:
          processedItems,

        total:
          calculatedTotal,

        paymentMethod:
          dto.paymentMethod,

        paymentStatus:
          paymentStatus,

        status:
          'Pending'

      });


    // ---------------------------------------------------
    // SAVE
    // ---------------------------------------------------

    const savedOrder =
      await this.orderRepository.save(
        order
      );


    // ---------------------------------------------------
    // REAL-TIME NEW ORDER
    // ---------------------------------------------------

    this.ordersGateway.notifyNewOrder(
      savedOrder
    );


    // ---------------------------------------------------
    // RETURN
    // ---------------------------------------------------

    return {

      success: true,

      message:
        'Order created successfully',

      order:
        savedOrder

    };

  }


  // =====================================================
  // GET ALL ORDERS
  // =====================================================

  async findAll() {

    return await this.orderRepository.find({

      order: {

        createdAt: 'DESC'

      }

    });

  }


  // =====================================================
  // GET ONE ORDER
  // =====================================================

  async findOne(
    id: number
  ) {

    const order =
      await this.orderRepository.findOne({

        where: {
          id
        }

      });


    if (!order) {

      throw new NotFoundException(

        `Order ${id} not found`

      );

    }


    return order;

  }


  // =====================================================
  // GET ORDERS FOR TABLE
  //
  // Example:
  // GET /orders/table/1
  // =====================================================

  async findByTable(
    tableId: number
  ) {

    return await this.orderRepository.find({

      where: {

        tableId

      },

      order: {

        createdAt: 'DESC'

      }

    });

  }


  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  async updateStatus(

    id: number,

    status:
      | 'Pending'
      | 'Accepted'
      | 'Preparing'
      | 'Served'
      | 'Completed'

  ) {


    // ---------------------------------------------------
    // VALIDATE STATUS
    // ---------------------------------------------------

    const allowedStatuses = [

      'Pending',

      'Accepted',

      'Preparing',

      'Served',

      'Completed'

    ];


    if (
      !allowedStatuses.includes(
        status
      )
    ) {

      throw new BadRequestException(

        'Invalid order status'

      );

    }


    // ---------------------------------------------------
    // FIND ORDER
    // ---------------------------------------------------

    const order =
      await this.findOne(id);


    // ---------------------------------------------------
    // UPDATE
    // ---------------------------------------------------

    order.status =
      status;


    const updatedOrder =
      await this.orderRepository.save(
        order
      );


    // ---------------------------------------------------
    // REAL-TIME UPDATE
    // ---------------------------------------------------

    this.ordersGateway.notifyOrderUpdated(
      updatedOrder
    );


    return {

      success: true,

      message:
        'Order status updated successfully',

      order:
        updatedOrder

    };

  }


  // =====================================================
  // UPDATE PAYMENT
  // =====================================================

  async updatePayment(

    id: number,

    paymentMethod:
      | 'Cash'
      | 'Online',

    paymentStatus:
      | 'Paid'
      | 'Pending',

    transactionId?: string

  ) {


    // ---------------------------------------------------
    // VALIDATE PAYMENT METHOD
    // ---------------------------------------------------

    if (
      paymentMethod !== 'Cash' &&
      paymentMethod !== 'Online'
    ) {

      throw new BadRequestException(

        'Payment method must be Cash or Online'

      );

    }


    // ---------------------------------------------------
    // VALIDATE PAYMENT STATUS
    // ---------------------------------------------------

    if (
      paymentStatus !== 'Paid' &&
      paymentStatus !== 'Pending'
    ) {

      throw new BadRequestException(

        'Payment status must be Paid or Pending'

      );

    }


    // ---------------------------------------------------
    // GET ORDER
    // ---------------------------------------------------

    const order =
      await this.findOne(id);


    // ---------------------------------------------------
    // UPDATE PAYMENT
    // ---------------------------------------------------

    order.paymentMethod =
      paymentMethod;


    order.paymentStatus =
      paymentStatus;


    order.transactionId =
      transactionId || null;


    if (
      paymentStatus === 'Paid'
    ) {

      order.paidAt =
        new Date();

    }

    else {

      order.paidAt =
        null;

    }


    // ---------------------------------------------------
    // SAVE
    // ---------------------------------------------------

    const updatedOrder =
      await this.orderRepository.save(
        order
      );


    // ---------------------------------------------------
    // REAL-TIME UPDATE
    // ---------------------------------------------------

    this.ordersGateway.notifyOrderUpdated(
      updatedOrder
    );


    return {

      success: true,

      message:
        'Payment updated successfully',

      order:
        updatedOrder

    };

  }

}