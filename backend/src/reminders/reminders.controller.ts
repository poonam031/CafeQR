/* eslint-disable prettier/prettier */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';

import {
    RemindersService
} from './reminders.service';

import {
    CreateReminderDto
} from './create-reminder.dto';

import {
    UpdateReminderDto
} from './update-reminder.dto';


@Controller('reminders')
export class RemindersController {

    constructor(
        private readonly remindersService:
            RemindersService
    ) {}


    /* =========================================
       CREATE
       POST /reminders
    ========================================== */

    @Post()
    create(
        @Body() dto: CreateReminderDto
    ) {

        return this.remindersService.create(
            dto
        );

    }


    /* =========================================
       GET ALL
       GET /reminders
    ========================================== */

    @Get()
    findAll() {

        return this.remindersService.findAll();

    }


    /* =========================================
       GET ONE
       GET /reminders/:id
    ========================================== */

    @Get(':id')
    findOne(
        @Param('id') id: string
    ) {

        return this.remindersService.findOne(
            Number(id)
        );

    }


    /* =========================================
       UPDATE
       PATCH /reminders/:id
    ========================================== */

    @Patch(':id')
    update(

        @Param('id') id: string,

        @Body() dto: UpdateReminderDto

    ) {

        return this.remindersService.update(

            Number(id),

            dto

        );

    }


    /* =========================================
       COMPLETE
       PATCH /reminders/:id/complete
    ========================================== */

    @Patch(':id/complete')
    complete(
        @Param('id') id: string
    ) {

        return this.remindersService.complete(
            Number(id)
        );

    }


    /* =========================================
       DELETE
       DELETE /reminders/:id
    ========================================== */

    @Delete(':id')
    remove(
        @Param('id') id: string
    ) {

        return this.remindersService.remove(
            Number(id)
        );

    }

}