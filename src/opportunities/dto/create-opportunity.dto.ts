import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Refonte du site Web' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: false, example: 'Projet complet de redesign UX/UI' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 4500 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ required: false, example: 'new' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    required: false,
    example: 3,
    description: 'ID du client associé',
  })
  @IsOptional()
  customerId?: number;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID du user propriétaire',
  })
  @IsOptional()
  userId?: number;
}
