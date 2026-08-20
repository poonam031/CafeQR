/* eslint-disable prettier/prettier */

export class UpdateOrderStatusDto {

  status:
    | 'Pending'
    | 'Accepted'
    | 'Preparing'
    | 'Served'
    | 'Completed';

}