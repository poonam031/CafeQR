/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>
  ) {}

  create(dto: CreateOrderDto) {
    const order = this.orderRepository.create(dto);
    return this.orderRepository.save(order);
  }

  findAll() {
    return this.orderRepository.find({
      order: {
        createdAt: 'ASC'
      }
    });
  }

  async updateStatus(id: number, status: string) {

  await this.orderRepository.update(id, {
    status: status
  });

  return this.orderRepository.findOne({
    where: {
      id: id
    }
  });

}

}