/* eslint-disable prettier/prettier */
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}