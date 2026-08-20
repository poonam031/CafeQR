/* eslint-disable prettier/prettier */

import {
  Module
} from '@nestjs/common';

import {
  TypeOrmModule
} from '@nestjs/typeorm';

import {
  OrdersController
} from './orders.controller';

import {
  OrdersService
} from './orders.service';

import {
  OrdersGateway
} from './orders.gateway';

import {
  OrderEntity
} from './order.entity';


@Module({

  imports: [

    TypeOrmModule.forFeature([

      OrderEntity

    ])

  ],


  controllers: [

    OrdersController

  ],


  providers: [

    OrdersService,

    OrdersGateway

  ],


  exports: [

    OrdersService,

    OrdersGateway

  ]

})
export class OrdersModule {}