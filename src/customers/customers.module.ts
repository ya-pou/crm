import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Customer } from './entities/customer.entity';
import { UsersModule } from 'src/users/users.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, User]),
    UsersModule,
    CaslModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
