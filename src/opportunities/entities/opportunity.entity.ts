import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount?: number;

  @Column({ length: 50, default: 'new' })
  status: string; // new, in-progress, won, lost, etc.

  // ---- Relations ----
  @ManyToOne(() => Customer, (customer) => customer.opportunities, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;
  @Column({ nullable: true })
  customerId?: number;

  @ManyToOne(() => User, (user) => user.opportunities, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({ nullable: true })
  userId?: number;
}
