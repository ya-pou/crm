import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  // @isUnique({ tableName: 'users', column: 'mail' })
  email: string;

  @ApiProperty()
  @IsEnum(['ADMIN', 'MANAGER', 'USER'])
  profil: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
