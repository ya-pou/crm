import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from './entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepo.create(dto);

    if (dto.userId) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });

      if (!user) {
        throw new BadRequestException(
          `User with ID ${dto.userId} does not exist`,
        );
      }

      customer.user = user;
    }

    return this.customerRepo.save(customer);
  }

  findAll(): Promise<Customer[]> {
    return this.customerRepo.find({
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    // Si userId est modifié
    if (dto.userId !== undefined) {
      if (dto.userId === null) {
        customer.user = null;
        customer.userId = null;
      } else {
        const user = await this.userRepo.findOne({ where: { id: dto.userId } });

        if (!user) {
          throw new BadRequestException(
            `User with ID ${dto.userId} not exists`,
          );
        }

        customer.user = user;
      }
    }

    Object.assign(customer, dto);

    return this.customerRepo.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepo.remove(customer);
  }
}
