import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,

    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateOpportunityDto): Promise<Opportunity> {
    const opp = this.opportunityRepo.create(dto);

    // Relation Customer
    if (dto.customerId) {
      const customer = await this.customerRepo.findOne({
        where: { id: dto.customerId },
      });
      if (!customer)
        throw new BadRequestException(`Customer ${dto.customerId} not found`);
      opp.customer = customer;
    }

    // Relation User
    if (dto.userId) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new BadRequestException(`User ${dto.userId} not found`);
      opp.user = user;
    }

    return this.opportunityRepo.save(opp);
  }

  findAll(): Promise<Opportunity[]> {
    return this.opportunityRepo.find({
      relations: ['customer', 'user'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Opportunity> {
    const opp = await this.opportunityRepo.findOne({
      where: { id },
      relations: ['customer', 'user'],
    });

    if (!opp) throw new NotFoundException(`Opportunity ${id} not found`);

    return opp;
  }

  async update(id: number, dto: UpdateOpportunityDto): Promise<Opportunity> {
    const opp = await this.findOne(id);

    // Customer
    if (dto.customerId !== undefined) {
      if (dto.customerId === null) {
        opp.customer = null;
        opp.customerId = null;
      } else {
        const customer = await this.customerRepo.findOne({
          where: { id: dto.customerId },
        });
        if (!customer)
          throw new BadRequestException(`Customer ${dto.customerId} not found`);
        opp.customer = customer;
      }
    }

    // User
    if (dto.userId !== undefined) {
      if (dto.userId === null) {
        opp.user = null;
        opp.userId = null;
      } else {
        const user = await this.userRepo.findOne({ where: { id: dto.userId } });
        if (!user)
          throw new BadRequestException(`User ${dto.userId} not found`);
        opp.user = user;
      }
    }

    Object.assign(opp, dto);

    return this.opportunityRepo.save(opp);
  }

  async remove(id: number): Promise<void> {
    const opp = await this.findOne(id);
    await this.opportunityRepo.remove(opp);
  }
}
