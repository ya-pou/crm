import { Customer } from 'src/customers/entities/customer.entity';
import { Opportunity } from 'src/opportunities/entities/opportunity.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @OneToMany(() => Opportunity, (opp) => opp.user)
  opportunities: Opportunity[];

  @Column({ default: true, nullable: false })
  actif: boolean;

  @ManyToOne(() => User, (u) => u.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'managerId' })
  manager?: User;

  @Column({ nullable: true })
  managerId?: number;
}
