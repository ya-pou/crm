import { IsEmail, IsNotEmpty } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User {
  @Column({ length: 255, nullable: false })
  @IsNotEmpty()
  lastName: string;

  @Column({ length: 255, nullable: false })
  @IsNotEmpty()
  name: string;

  @Column({ unique: true, nullable: false })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ length: 255, nullable: false })
  @IsNotEmpty()
  password: string;

  @Column({ default: true, nullable: false })
  actif: boolean;
}
