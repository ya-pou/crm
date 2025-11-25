import { Opportunity } from 'src/opportunities/entities/opportunity.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, nullable: false })
  lastName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true, type: 'varchar', length: 20, unique: true })
  telephone?: string;

  @Column({ nullable: true, type: 'varchar', length: 20 })
  sector?: string;

  @Column({ nullable: true })
  status?: string;

  @ManyToOne(() => User, (user) => user.customers, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @OneToMany(() => Opportunity, (opp) => opp.customer)
  opportunities: Opportunity[];
}
