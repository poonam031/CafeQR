/* eslint-disable prettier/prettier */

import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  OrderEntity,
} from '../orders/order.entity';

import {
  PaymentEntity,
} from './payments.entity';

import {
  PaymentsController,
} from './payments.controller';

import {
  PaymentsService,
} from './payments.service';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      OrderEntity,
      PaymentEntity,
    ]),

  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PaymentsService,
  ],

  exports: [
    PaymentsService,
  ],

})
export class PaymentsModule {}