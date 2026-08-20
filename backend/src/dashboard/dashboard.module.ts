/* eslint-disable prettier/prettier */

import {
  Module
} from '@nestjs/common';

import {
  TypeOrmModule
} from '@nestjs/typeorm';

import {
  DashboardController
} from './dashboard.controller';

import {
  DashboardService
} from './dashboard.service';

import {
  TableEntity
} from '../tables/table.entity';


@Module({

  imports: [

    TypeOrmModule.forFeature([

      TableEntity

    ])

  ],

  controllers: [

    DashboardController

  ],

  providers: [

    DashboardService

  ]

})
export class DashboardModule {}