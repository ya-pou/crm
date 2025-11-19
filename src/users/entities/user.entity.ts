import { IsEmail, IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'MANAGER', 'USER'],
    default: 'USER',
    nullable: false,
  })
  @IsNotEmpty()
  profil: string;

  @Column({ default: true, nullable: false })
  actif: boolean;
}
