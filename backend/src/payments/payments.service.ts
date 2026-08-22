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




  // ==========================================
// CREATE CASHFREE PAYMENT
// ==========================================

async createCashfreePayment(orderId: number) {

  const order = await this.orderRepository.findOne({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new NotFoundException(
      `Order ${orderId} not found`,
    );
  }

  // Already paid
  if (order.paymentStatus === 'Paid') {
    throw new BadRequestException(
      'This order has already been paid',
    );
  }

  const amount = Number(order.total);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestException(
      'Invalid order amount',
    );
  }

  const clientId =
    process.env.CASHFREE_CLIENT_ID;

  const clientSecret =
    process.env.CASHFREE_CLIENT_SECRET;

  const baseUrl =
    process.env.CASHFREE_BASE_URL ||
    'https://sandbox.cashfree.com';

  const apiVersion =
    process.env.CASHFREE_API_VERSION ||
    '2025-01-01';

  if (!clientId || !clientSecret) {
    throw new InternalServerErrorException(
      'Cashfree API credentials are not configured',
    );
  }

  // ========================================
  // UNIQUE CASHFREE ORDER ID
  // ========================================

  const cashfreeOrderId =
    `CAFEQR_${order.id}_${Date.now()}`;

  // ========================================
  // FIND EXISTING PAYMENT
  // ========================================

  let payment =
    await this.paymentRepository.findOne({
      where: {
        order: {
          id: orderId,
        },
      },
    });

  // ========================================
  // CREATE PAYMENT RECORD
  // ========================================

  if (!payment) {

    payment =
      this.paymentRepository.create({
        order,

        method: 'UPI',

        status: 'PENDING',

        amount,

        merchantOrderId:
          cashfreeOrderId,

        paymentMode:
          'CASHFREE_UPI',

        expiresAt:
          new Date(
            Date.now() +
            15 * 60 * 1000,
          ),
      });

  } else {

    payment.status = 'PENDING';

    payment.amount = amount;

    payment.merchantOrderId =
      cashfreeOrderId;

    payment.paymentMode =
      'CASHFREE_UPI';

    payment.expiresAt =
      new Date(
        Date.now() +
        15 * 60 * 1000,
      );
  }

  const savedPayment =
    await this.paymentRepository.save(
      payment,
    );

  // ========================================
  // CASHFREE CREATE ORDER
  // ========================================

  const phone =
    process.env.CASHFREE_CUSTOMER_PHONE ||
    '9999999999';

  const returnUrl =
    process.env.CASHFREE_RETURN_URL ||
    'http://localhost:4200/online-payment';

  const response =
    await fetch(
      `${baseUrl}/pg/orders`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Accept:
            'application/json',

          'x-client-id':
            clientId,

          'x-client-secret':
            clientSecret,

          'x-api-version':
            apiVersion,
        },

        body: JSON.stringify({

          order_id:
            cashfreeOrderId,

          order_amount:
            amount,

          order_currency:
            'INR',

          customer_details: {

            customer_id:
              `CUSTOMER_${order.id}`,

            customer_phone:
              phone,

            customer_name:
              order.customerName ||
              'Cafe Customer',

          },

          order_meta: {

            return_url:
              `${returnUrl}?order_id=${cashfreeOrderId}`,

          },

          order_note:
            `CafeQR Order #${order.id}`,

        }),
      },
    );

  const data =
    await response.json();

  if (!response.ok) {

    console.error(
      'Cashfree Create Order Error:',
      data,
    );

    throw new BadRequestException(
      data?.message ||
      'Cashfree order creation failed',
    );
  }

  // ========================================
  // UPDATE LOCAL PAYMENT
  // ========================================

  payment.merchantOrderId =
    data.order_id ||
    cashfreeOrderId;

  payment.paymentMode =
    'CASHFREE_UPI';

  payment.status =
    'PENDING';

  await this.paymentRepository.save(
    payment,
  );

  // ========================================
  // UPDATE LOCAL ORDER
  // ========================================

  order.paymentMethod =
    'Online';

  order.paymentStatus =
    'Pending';

  order.transactionId =
    data.order_id ||
    cashfreeOrderId;

  await this.orderRepository.save(
    order,
  );

  // ========================================
  // RETURN TO ANGULAR
  // ========================================

  return {

    success: true,

    orderId:
      order.id,

    amount,

    currency:
      'INR',

    paymentId:
      savedPayment.id,

    cashfreeOrderId:
      data.order_id,

    paymentSessionId:
      data.payment_session_id,

    status:
      'PENDING',

    message:
      'Cashfree payment created',

  };
}





// ==========================================
// VERIFY CASHFREE PAYMENT
// ==========================================

async verifyCashfreePayment(
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

    return {
      success: true,
      orderId,
      paymentStatus: 'NOT_CREATED',
      orderPaymentStatus:
        order.paymentStatus,
    };
  }

  // Already paid
  if (
    payment.status === 'PAID'
  ) {

    return {
      success: true,
      orderId,
      paymentStatus: 'PAID',
      orderPaymentStatus: 'Paid',
      transactionId:
        payment.transactionId,
      paidAt:
        payment.paidAt,
    };
  }

  const clientId =
    process.env.CASHFREE_CLIENT_ID;

  const clientSecret =
    process.env.CASHFREE_CLIENT_SECRET;

  const baseUrl =
    process.env.CASHFREE_BASE_URL ||
    'https://sandbox.cashfree.com';

  const apiVersion =
    process.env.CASHFREE_API_VERSION ||
    '2025-01-01';

  if (!clientId || !clientSecret) {

    throw new InternalServerErrorException(
      'Cashfree API credentials are not configured',
    );
  }

  const cashfreeOrderId =
    payment.merchantOrderId;

  // ========================================
  // GET CASHFREE PAYMENTS
  // ========================================

  const response =
    await fetch(
      `${baseUrl}/pg/orders/${encodeURIComponent(
        cashfreeOrderId,
      )}/payments`,
      {
        method: 'GET',

        headers: {

          Accept:
            'application/json',

          'x-client-id':
            clientId,

          'x-client-secret':
            clientSecret,

          'x-api-version':
            apiVersion,

        },
      },
    );

  const data =
    await response.json();

  if (!response.ok) {

    console.error(
      'Cashfree Verify Error:',
      data,
    );

    throw new BadRequestException(
      data?.message ||
      'Unable to verify Cashfree payment',
    );
  }

  console.log(
    'Cashfree Payments:',
    JSON.stringify(
      data,
      null,
      2,
    ),
  );

  // ========================================
  // FIND SUCCESS PAYMENT
  // ========================================

  const successfulPayment =
    Array.isArray(data)
      ? data.find(
          (transaction: any) =>
            transaction.payment_status ===
            'SUCCESS',
        )
      : null;

  // ========================================
  // SUCCESS
  // ========================================

  if (successfulPayment) {

    payment.status =
      'PAID';

    payment.transactionId =
      successfulPayment.cf_payment_id
        ? String(
            successfulPayment.cf_payment_id,
          )
        : payment.transactionId;

    payment.bankTxnId =
      successfulPayment.bank_reference ||
      null;

    payment.responseCode =
      successfulPayment.payment_status ||
      'SUCCESS';

    payment.responseMessage =
      'Payment successful';

    payment.paymentMode =
      successfulPayment.payment_group ||
      'UPI';

    payment.paidAt =
      new Date();

    await this.paymentRepository.save(
      payment,
    );

    // UPDATE ORDER

    order.paymentMethod =
      'Online';

    order.paymentStatus =
      'Paid';

    order.transactionId =
      payment.transactionId ||
      payment.merchantOrderId;

    order.paidAt =
      new Date();

    await this.orderRepository.save(
      order,
    );

    return {

      success: true,

      orderId,

      amount:
        Number(order.total),

      paymentStatus:
        'PAID',

      orderPaymentStatus:
        'Paid',

      transactionId:
        payment.transactionId,

      bankTxnId:
        payment.bankTxnId,

      paidAt:
        payment.paidAt,

    };
  }

  // ========================================
  // PENDING PAYMENT
  // ========================================

  const pendingPayment =
    Array.isArray(data)
      ? data.find(
          (transaction: any) =>
            transaction.payment_status ===
            'PENDING',
        )
      : null;

  if (pendingPayment) {

    payment.status =
      'PENDING';

    payment.responseCode =
      'PENDING';

    payment.responseMessage =
      'Payment is pending';

    await this.paymentRepository.save(
      payment,
    );

    order.paymentStatus =
      'Pending';

    await this.orderRepository.save(
      order,
    );

    return {

      success: true,

      orderId,

      amount:
        Number(order.total),

      paymentStatus:
        'PENDING',

      orderPaymentStatus:
        'Pending',

      transactionId:
        payment.transactionId,

    };
  }

  // ========================================
  // NO SUCCESS / PENDING PAYMENT
  //
  // Do not mark the payment FAILED just because
  // the customer has not completed checkout yet.
  payment.status =
    'PENDING';

  payment.responseCode =
    'PENDING';

  payment.responseMessage =
    'Payment is pending';

  await this.paymentRepository.save(
    payment,
  );

  order.paymentStatus =
    'Pending';

  await this.orderRepository.save(
    order,
  );

  return {

    success: true,

    orderId,

    amount:
      Number(order.total),

    paymentStatus:
      'PENDING',

    orderPaymentStatus:
      'Pending',

    transactionId:
      payment.transactionId,

    responseMessage:
      payment.responseMessage,

  };

}

}