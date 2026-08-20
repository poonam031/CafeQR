/* eslint-disable prettier/prettier */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  OrderEntity,
} from '../orders/order.entity';

import {
  PaymentEntity,
} from './payments.entity';

import * as crypto from 'crypto';



@Injectable()
export class PaymentsService {

  constructor(

    @InjectRepository(OrderEntity)
    private readonly orderRepository:
      Repository<OrderEntity>,

    @InjectRepository(PaymentEntity)
    private readonly paymentRepository:
      Repository<PaymentEntity>,

  ) {}


  // ==========================================
  // GET PAYMENT
  // ==========================================

  async getPayment(
    orderId: number,
  ) {

    const order =
      await this.orderRepository.findOne({

        where: {
          id: orderId,
        },

      });


    if (!order) {

      throw new NotFoundException(
        `Order ${orderId} not found`,
      );

    }


    const payment =
      await this.paymentRepository.findOne({

        where: {

          order: {
            id: orderId,
          },

        },

      });


    return {

      success: true,

      orderId:
        order.id,

      tableId:
        order.tableId,

      amount:
        Number(order.total),

      total:
        Number(order.total),

      paymentMethod:
        order.paymentMethod,

      orderPaymentStatus:
        order.paymentStatus,

      transactionId:
        order.transactionId,

      paidAt:
        order.paidAt,

      payment:
        payment
          ? {

              id:
                payment.id,

              method:
                payment.method,

              status:
                payment.status,

              amount:
                Number(payment.amount),

              merchantOrderId:
                payment.merchantOrderId,

              transactionId:
                payment.transactionId,

              bankTxnId:
                payment.bankTxnId,

              paymentMode:
                payment.paymentMode,

              responseCode:
                payment.responseCode,

              responseMessage:
                payment.responseMessage,

              paidAt:
                payment.paidAt,

              expiresAt:
                payment.expiresAt,

            }
          : null,

    };

  }


  // ==========================================
  // CREATE UPI INTENT PAYMENT
  // ==========================================

  async createUpiPayment(
    orderId: number,
  ) {

    // ========================================
    // 1. FIND ORDER
    // ========================================

    const order =
      await this.orderRepository.findOne({

        where: {
          id: orderId,
        },

      });


    if (!order) {

      throw new NotFoundException(
        `Order ${orderId} not found`,
      );

    }


    // ========================================
    // 2. CHECK ALREADY PAID
    // ========================================

    if (
      order.paymentStatus ===
      'Paid'
    ) {

      throw new BadRequestException(
        'This order has already been paid',
      );

    }


    // ========================================
    // 3. GET AMOUNT FROM DATABASE
    // ========================================

    const amount =
      Number(order.total);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      throw new BadRequestException(
        'Invalid order amount',
      );

    }


    // ========================================
    // 4. GET CAFE UPI ID
    // ========================================

    const upiId =
      process.env.CAFE_UPI_ID;


    if (!upiId) {

      throw new InternalServerErrorException(
        'CAFE_UPI_ID is not configured',
      );

    }


    // ========================================
    // 5. GET CAFE NAME
    // ========================================

    const cafeName =
      process.env.CAFE_NAME ||
      'CafeQR';


    // ========================================
    // 6. CHECK EXISTING PENDING PAYMENT
    // ========================================

    const existingPayment =
      await this.paymentRepository.findOne({

        where: {

          order: {
            id: orderId,
          },

          status:
            'PENDING',

        },

      });


    if (existingPayment) {

      const expiresAt =
        existingPayment.expiresAt
          ? new Date(
              existingPayment.expiresAt,
            )
          : null;


      // ======================================
      // REUSE ACTIVE PAYMENT
      // ======================================

      if (
        expiresAt &&
        expiresAt.getTime() >
          Date.now()
      ) {

        const upiUrl =
          this.buildUpiIntentUrl({

            upiId,

            cafeName,

            amount,

            merchantOrderId:
              existingPayment
                .merchantOrderId,

            orderId,

          });


        return {

          success:
            true,

          orderId:
            order.id,

          amount,

          currency:
            'INR',

          paymentId:
            existingPayment.id,

          merchantOrderId:
            existingPayment
              .merchantOrderId,

          status:
            existingPayment.status,

          expiresAt:
            existingPayment.expiresAt,

          upiId,

          upiUrl,

          message:
            'Existing UPI payment request returned',

        };

      }


      // ======================================
      // EXPIRED PAYMENT
      // ======================================

      existingPayment.status =
        'EXPIRED';


      existingPayment.responseMessage =
        'Previous UPI payment request expired';


      await this.paymentRepository.save(
        existingPayment,
      );

    }


    // ========================================
    // 7. CREATE UNIQUE TRANSACTION REFERENCE
    // ========================================

    const randomPart =
      crypto
        .randomBytes(6)
        .toString('hex');


    const merchantOrderId =
      `CAFEQR_${order.id}_${randomPart}`;


    // ========================================
    // 8. PAYMENT EXPIRY
    // ========================================

    const expiresAt =
      new Date(
        Date.now() +
        15 * 60 * 1000,
      );


    // ========================================
    // 9. CREATE PAYMENT
    // ========================================

    const payment =
      this.paymentRepository.create({

        order,

        method:
          'UPI',

        status:
          'PENDING',

        amount,

        merchantOrderId,

        paymentMode:
          'UPI_INTENT',

        expiresAt,

      });


    const savedPayment =
      await this.paymentRepository.save(
        payment,
      );


    // ========================================
    // 10. CREATE UPI URL
    // ========================================

    const upiUrl =
      this.buildUpiIntentUrl({

        upiId,

        cafeName,

        amount,

        merchantOrderId,

        orderId,

      });


    // ========================================
    // 11. UPDATE ORDER
    // ========================================

    order.paymentMethod =
      'Online';

    order.paymentStatus =
      'Pending';

    order.transactionId =
      merchantOrderId;


    await this.orderRepository.save(
      order,
    );


    // ========================================
    // 12. RETURN
    // ========================================

    return {

      success:
        true,

      orderId:
        order.id,

      amount,

      currency:
        'INR',

      paymentId:
        savedPayment.id,

      merchantOrderId,

      status:
        savedPayment.status,

      expiresAt,

      upiId,

      upiUrl,

      message:
        'UPI payment intent created',

    };

  }


  // ==========================================
  // BUILD UPI INTENT URL
  // ==========================================

  private buildUpiIntentUrl(
    data: {

      upiId: string;

      cafeName: string;

      amount: number;

      merchantOrderId: string;

      orderId: number;

    },
  ): string {

    const params =
      new URLSearchParams({

        pa:
          data.upiId,

        pn:
          data.cafeName,

        tr:
          data.merchantOrderId,

        tn:
          `CafeQR Order #${data.orderId}`,

        am:
          data.amount.toFixed(2),

        cu:
          'INR',

      });


    return `upi://pay?${params.toString()}`;

  }


  // ==========================================
  // GET UPI PAYMENT STATUS
  // ==========================================

  async getUpiPaymentStatus(
    orderId: number,
  ) {

    // ========================================
    // FIND ORDER
    // ========================================

    const order =
      await this.orderRepository.findOne({

        where: {
          id: orderId,
        },

      });


    if (!order) {

      throw new NotFoundException(
        `Order ${orderId} not found`,
      );

    }


    // ========================================
    // FIND PAYMENT
    // ========================================

    const payment =
      await this.paymentRepository.findOne({

        where: {

          order: {
            id: orderId,
          },

        },

      });


    if (!payment) {

      return {

        success:
          true,

        orderId,

        amount:
          Number(order.total),

        paymentStatus:
          'NOT_CREATED',

        orderPaymentStatus:
          order.paymentStatus,

      };

    }


    // ========================================
    // CHECK EXPIRY
    // ========================================

    if (

      payment.status ===
        'PENDING' &&

      payment.expiresAt &&

      new Date(
        payment.expiresAt,
      ).getTime() <
        Date.now()

    ) {

      payment.status =
        'EXPIRED';


      payment.responseMessage =
        'UPI payment request expired';


      await this.paymentRepository.save(
        payment,
      );

    }


    // ========================================
    // RETURN STATUS
    // ========================================

    return {

      success:
        true,

      orderId,

      amount:
        Number(payment.amount),

      paymentId:
        payment.id,

      merchantOrderId:
        payment.merchantOrderId,

      paymentStatus:
        payment.status,

      orderPaymentStatus:
        order.paymentStatus,

      transactionId:
        payment.transactionId,

      bankTxnId:
        payment.bankTxnId,

      responseCode:
        payment.responseCode,

      responseMessage:
        payment.responseMessage,

      paidAt:
        payment.paidAt,

      expiresAt:
        payment.expiresAt,

    };

  }


  // ==========================================
  // MARK PAYMENT PAID
  //
  // THIS SHOULD ONLY BE CALLED BY A TRUSTED
  // PAYMENT VERIFICATION PROCESS.
  // ==========================================

  async markPaid(

    orderId: number,

    transactionId?: string,

    bankTxnId?: string,

    responseCode?: string,

    responseMessage?: string,

  ) {

    const order =
      await this.orderRepository.findOne({

        where: {
          id: orderId,
        },

      });


    if (!order) {

      throw new NotFoundException(
        `Order ${orderId} not found`,
      );

    }


    const payment =
      await this.paymentRepository.findOne({

        where: {

          order: {
            id: orderId,
          },

        },

      });


    if (!payment) {

      throw new NotFoundException(
        `Payment for order ${orderId} not found`,
      );

    }


    // ========================================
    // ALREADY PAID
    // ========================================

    if (
      payment.status ===
      'PAID'
    ) {

      return {

        success:
          true,

        message:
          'Payment already marked as paid',

        orderId,

        paymentStatus:
          payment.status,

        transactionId:
          payment.transactionId,

      };

    }


    // ========================================
    // MARK PAYMENT
    // ========================================

    payment.status =
      'PAID';

    payment.transactionId =
      transactionId ||
      payment.transactionId;

    payment.bankTxnId =
      bankTxnId ||
      null;

    payment.responseCode =
      responseCode ||
      null;

    payment.responseMessage =
      responseMessage ||
      'Payment successful';

    payment.paymentMode =
      'UPI';

    payment.paidAt =
      new Date();


    await this.paymentRepository.save(
      payment,
    );


    // ========================================
    // UPDATE ORDER
    // ========================================

    order.paymentMethod =
      'Online';

    order.paymentStatus =
      'Paid';

    order.transactionId =
      transactionId ||
      payment.merchantOrderId;

    order.paidAt =
      new Date();


    const savedOrder =
      await this.orderRepository.save(
        order,
      );


    return {

      success:
        true,

      message:
        'Payment marked as paid',

      orderId:
        savedOrder.id,

      paymentStatus:
        payment.status,

      transactionId:
        payment.transactionId,

      bankTxnId:
        payment.bankTxnId,

      paidAt:
        payment.paidAt,

    };

  }


  // ==========================================
  // MARK PAYMENT FAILED
  // ==========================================

  async markFailed(

    orderId: number,

    responseCode?: string,

    responseMessage?: string,

  ) {

    const order =
      await this.orderRepository.findOne({

        where: {
          id: orderId,
        },

      });


    if (!order) {

      throw new NotFoundException(
        `Order ${orderId} not found`,
      );

    }


    const payment =
      await this.paymentRepository.findOne({

        where: {

          order: {
            id: orderId,
          },

        },

      });


    if (!payment) {

      throw new NotFoundException(
        `Payment for order ${orderId} not found`,
      );

    }


    payment.status =
      'FAILED';

    payment.responseCode =
      responseCode ||
      null;

    payment.responseMessage =
      responseMessage ||
      'Payment failed';


    await this.paymentRepository.save(
      payment,
    );


    order.paymentStatus =
      'Pending';


    await this.orderRepository.save(
      order,
    );


    return {

      success:
        true,

      message:
        'Payment marked as failed',

      orderId,

      paymentStatus:
        payment.status,

      responseCode:
        payment.responseCode,

      responseMessage:
        payment.responseMessage,

    };

  }


  // ==========================================
  // MARK PAYMENT PENDING
  // ==========================================

  async markPending(
    orderId: number,
  ) {

    const order =
      await this.orderRepository.findOne({

        where: {
          id: orderId,
        },

      });


    if (!order) {

      throw new NotFoundException(
        `Order ${orderId} not found`,
      );

    }


    const payment =
      await this.paymentRepository.findOne({

        where: {

          order: {
            id: orderId,
          },

        },

      });


    if (!payment) {

      throw new NotFoundException(
        `Payment for order ${orderId} not found`,
      );

    }


    payment.status =
      'PENDING';

    payment.responseMessage =
      'Payment is pending';


    await this.paymentRepository.save(
      payment,
    );


    order.paymentStatus =
      'Pending';

    order.paidAt =
      null;


    await this.orderRepository.save(
      order,
    );


    return {

      success:
        true,

      message:
        'Payment marked as pending',

      orderId,

      paymentStatus:
        payment.status,

    };

  }

}