import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Jean' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Dupont' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+33612345678', required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ example: 'Immobilier', required: false })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: 12,
    required: false,
    description: 'ID de l’utilisateur propriétaire',
  })
  @IsOptional()
  userId?: number;
}
