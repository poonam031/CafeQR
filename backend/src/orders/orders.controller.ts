/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './update-order-status.dto';

@Controller('orders')
export class OrdersController {
     constructor(
    private readonly ordersService: OrdersService
  ) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
updateStatus(
  @Param('id') id: number,
  @Body() dto: UpdateOrderStatusDto,
) {
  return this.ordersService.updateStatus(+id, dto.status);
}
}
