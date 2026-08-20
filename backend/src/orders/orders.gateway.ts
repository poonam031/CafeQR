/* eslint-disable prettier/prettier */

import {
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';

import {
  Server
} from 'socket.io';


@WebSocketGateway({

  cors: {

    origin: '*'

  }

})
export class OrdersGateway {


  @WebSocketServer()

  server: Server;


  // =====================================================
  // NEW ORDER
  // =====================================================

  notifyNewOrder(
    order: any
  ): void {

    this.server.emit(
      'newOrder',
      {

        id:
          order.id,

        tableId:
          order.tableId,

        customerName:
          order.customerName,

        items:
          order.items,

        total:
          order.total,

        status:
          order.status,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        transactionId:
          order.transactionId,

        createdAt:
          order.createdAt

      }
    );

  }


  // =====================================================
  // ORDER UPDATED
  // =====================================================

  notifyOrderUpdated(
    order: any
  ): void {

    this.server.emit(
      'orderUpdated',
      {

        id:
          order.id,

        tableId:
          order.tableId,

        customerName:
          order.customerName,

        items:
          order.items,

        total:
          order.total,

        status:
          order.status,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        transactionId:
          order.transactionId,

        paidAt:
          order.paidAt,

        createdAt:
          order.createdAt

      }
    );

  }

}