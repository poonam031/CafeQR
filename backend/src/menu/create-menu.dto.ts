/* eslint-disable prettier/prettier */
export class CreateMenuDto {

  name: string;

  category: string;

  price: number;

  description?: string;

  image?: string;

  isAvailable?: boolean;

  isVeg?: boolean;

}