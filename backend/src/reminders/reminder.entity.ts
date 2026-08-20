/* eslint-disable prettier/prettier */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from 'typeorm';

@Entity()
export class Reminder {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    customerName: string;

    @Column()
    date: string;

    @Column()
    time: string;

    @Column({
        nullable: true
    })
    guests: number;

    @Column({
        nullable: true
    })
    tableNumber: string;

    @Column({
        nullable: true
    })
    notes: string;

    @Column({
        default: '1 hour'
    })
    remindBefore: string;

    @Column({
        default: false
    })
    completed: boolean;

    @CreateDateColumn()
    createdAt: Date;
}