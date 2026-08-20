/* eslint-disable prettier/prettier */

import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import {
  PaymentsService,
} from './payments.service';


@Controller('payments')
export class PaymentsController {

  constructor(
    private readonly paymentsService:
      PaymentsService,
  ) {}


  // ==========================================
  // GET PAYMENT
  // ==========================================

  @Get('order/:orderId')
  getPayment(

    @Param(
      'orderId',
      ParseIntPipe,
    )
    orderId: number,

  ) {

    return this.paymentsService.getPayment(
      orderId,
    );

  }


  // ==========================================
  // CREATE UPI PAYMENT
  // ==========================================

  @Post('upi/create/:orderId')
  createUpiPayment(

    @Param(
      'orderId',
      ParseIntPipe,
    )
    orderId: number,

  ) {

    return this.paymentsService.createUpiPayment(
      orderId,
    );

  }


  // ==========================================
  // GET UPI PAYMENT STATUS
  // ==========================================

  @Get('upi/status/:orderId')
  getUpiPaymentStatus(

    @Param(
      'orderId',
      ParseIntPipe,
    )
    orderId: number,

  ) {

    return this.paymentsService.getUpiPaymentStatus(
      orderId,
    );

  }


  // ==========================================
  // INTERNAL / ADMIN PAYMENT CONFIRMATION
  //
  // DO NOT CALL THIS FROM CUSTOMER ANGULAR
  // UNTIL PAYMENT HAS BEEN VERIFIED.
  // ==========================================

  @Put('order/:orderId/paid')
  markPaid(

    @Param(
      'orderId',
      ParseIntPipe,
    )
    orderId: number,

    @Body()
    body: {

      transactionId?: string;

      bankTxnId?: string;

      responseCode?: string;

      responseMessage?: string;

    },

  ) {

    return this.paymentsService.markPaid(

      orderId,

      body.transactionId,

      body.bankTxnId,

      body.responseCode,

      body.responseMessage,

    );

  }


  // ==========================================
  // MARK PAYMENT FAILED
  // ==========================================

  @Put('order/:orderId/failed')
  markFailed(

    @Param(
      'orderId',
      ParseIntPipe,
    )
    orderId: number,

    @Body()
    body: {

      responseCode?: string;

      responseMessage?: string;

    },

  ) {

    return this.paymentsService.markFailed(

      orderId,

      body.responseCode,

      body.responseMessage,

    );

  }


  // ==========================================
  // MARK PAYMENT PENDING
  // ==========================================

  @Put('order/:orderId/pending')
  markPending(

    @Param(
      'orderId',
      ParseIntPipe,
    )
    orderId: number,

  ) {

    return this.paymentsService.markPending(
      orderId,
    );

  }

}