import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength
} from "class-validator";

export class CreateProductDto {

  @IsString()
  @MinLength(1)
  title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsString( { each: true, message: 'Cada elemento del arreglo debe ser un string' })
  @IsArray({message: '[sizes] debe ser un arreglo de strings'})
  sizes: string[];

  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @IsString( { each: true, message: 'Cada elemento del arreglo debe ser un string' })
  @IsArray({ message: '[tags] debe ser un arreglo de strings' })
  @IsOptional()
  tags?: string[];

  @IsString( { each: true, message: 'Cada elemento del arreglo debe ser un string' })
  @IsArray({ message: '[images] debe ser un arreglo de strings' })
  @IsOptional()
  images?: string[];

}
