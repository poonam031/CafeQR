/* eslint-disable prettier/prettier */
import {
    Injectable,
    NotFoundException
} from '@nestjs/common';

import {
    InjectRepository
} from '@nestjs/typeorm';

import {
    Repository
} from 'typeorm';

import { Reminder } from './reminder.entity';

import { CreateReminderDto } from './create-reminder.dto';

import { UpdateReminderDto } from './update-reminder.dto';


@Injectable()
export class RemindersService {

    constructor(

        @InjectRepository(Reminder)

        private reminderRepository:
            Repository<Reminder>

    ) {}


    /* =========================================
       CREATE REMINDER
    ========================================== */

    async create(
        dto: CreateReminderDto
    ) {

        const reminder =
            this.reminderRepository.create(dto);

        return this.reminderRepository.save(
            reminder
        );

    }


    /* =========================================
       GET ALL REMINDERS
    ========================================== */

    async findAll() {

        return this.reminderRepository.find({

            order: {

                date: 'ASC',

                time: 'ASC'

            }

        });

    }


    /* =========================================
       GET ONE REMINDER
    ========================================== */

    async findOne(id: number) {

        const reminder =
            await this.reminderRepository.findOne({

                where: {
                    id
                }

            });


        if (!reminder) {

            throw new NotFoundException(
                'Reminder not found'
            );

        }


        return reminder;

    }


    /* =========================================
       UPDATE REMINDER
    ========================================== */

    async update(
        id: number,
        dto: UpdateReminderDto
    ) {

        const reminder =
            await this.findOne(id);


        Object.assign(
            reminder,
            dto
        );


        return this.reminderRepository.save(
            reminder
        );

    }


    /* =========================================
       COMPLETE REMINDER
    ========================================== */

    async complete(id: number) {

        const reminder =
            await this.findOne(id);


        reminder.completed = true;


        return this.reminderRepository.save(
            reminder
        );

    }


    /* =========================================
       DELETE REMINDER
    ========================================== */

    async remove(id: number) {

        const reminder =
            await this.findOne(id);


        await this.reminderRepository.remove(
            reminder
        );


        return {

            message:
                'Reminder deleted successfully'

        };

    }

}