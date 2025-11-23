import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Opportunity } from './entities/opportunity.entity';
import { UsersModule } from 'src/users/users.module';
import { CustomersModule } from 'src/customers/customers.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, Customer, User]),
    UsersModule,
    CustomersModule,
    CaslModule,
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
})
export class OpportunitiesModule {}
