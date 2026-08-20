/* eslint-disable prettier/prettier */

import {
  Injectable
} from '@nestjs/common';

import {
  InjectRepository
} from '@nestjs/typeorm';

import {
  Repository
} from 'typeorm';

import {
  TableEntity
} from '../tables/table.entity';


@Injectable()
export class DashboardService {

  constructor(

    @InjectRepository(TableEntity)

    private readonly tableRepository:
      Repository<TableEntity>

  ) {}


  // =====================================================
  // DASHBOARD TABLE STATUS
  // =====================================================

  async getTables() {

    const tables =
      await this.tableRepository.find({

        select: {

          id: true,

          tableNumber: true,

          seats: true,

          status: true

        },

        order: {

          tableNumber: 'ASC'

        }

      });


    return tables;

  }


  // =====================================================
  // DASHBOARD SUMMARY
  // =====================================================

  async getSummary() {

    const total =
      await this.tableRepository.count();


    const booked =
      await this.tableRepository.count({

        where: {
          status: 'BOOKED'
        }

      });


    const free =
      await this.tableRepository.count({

        where: {
          status: 'FREE'
        }

      });


    return {

      total,

      booked,

      free

    };

  }

}