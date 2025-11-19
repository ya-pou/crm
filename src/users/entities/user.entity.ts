import { Customer } from 'src/customers/entities/customer.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  lastName: string;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'MANAGER', 'USER'],
    default: 'USER',
    nullable: false,
  })
  profil: string;

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @Column({ default: true, nullable: false })
  actif: boolean;
}
