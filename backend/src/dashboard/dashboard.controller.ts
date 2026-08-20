/* eslint-disable prettier/prettier */

import {
  Controller,
  Get
} from '@nestjs/common';

import {
  DashboardService
} from './dashboard.service';


@Controller('dashboard')
export class DashboardController {

  constructor(
    private readonly dashboardService:
      DashboardService
  ) {}


  // =====================================================
  // TABLE STATUS
  // =====================================================

  @Get('tables')
  async getTables() {

    return await this.dashboardService.getTables();

  }


  // =====================================================
  // SUMMARY
  // =====================================================

  @Get('summary')
  async getSummary() {

    return await this.dashboardService.getSummary();

  }

}