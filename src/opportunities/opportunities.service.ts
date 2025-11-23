import {
  BadRequestException,
  ForbiddenException,
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
import { Payload } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/roles/roles.guard';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,

    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly userService: UsersService,
    private readonly customerService: CustomersService,
  ) {}

  async create(
    dto: CreateOpportunityDto,
    payload: Payload,
  ): Promise<Opportunity> {
    const currentUser = await this.userService.getCurrent(payload);
    if (currentUser.profil === Role.ADMIN) {
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
        if (!user)
          throw new BadRequestException(`User ${dto.userId} not found`);
        opp.user = user;
      }

      return this.opportunityRepo.save(opp);
    } else if (currentUser.profil === Role.MANAGER) {
      const ownerId = dto.userId;

      const owner = await this.userService.findOne(ownerId);
      if (!owner) {
        throw new NotFoundException(`User with id ${ownerId} not found`);
      }

      if (owner.id !== currentUser.id && owner.managerId !== currentUser.id) {
        throw new ForbiddenException(
          `You cannot assign this opportunity to user ${owner.id}. This user is not in your team.`,
        );
      }

      const newOpportunity = this.opportunityRepo.create({
        ...dto,
        userId: owner.id,
      });

      return await this.opportunityRepo.save(newOpportunity);
    } else if (currentUser.profil === Role.USER) {
      const newOpportunity = this.opportunityRepo.create({
        ...dto,
        userId: currentUser.id,
      });

      return await this.opportunityRepo.save(newOpportunity);
    }
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

  async update(
    id: number,
    dto: UpdateOpportunityDto,
    payload: Payload,
  ): Promise<Opportunity> {
    const currentUser = await this.userService.getCurrent(payload);
    const opportunity = await this.findOne(id);
    if (!opportunity) {
      throw new NotFoundException(`Opportynity with ${id} not found`);
    }
    if (currentUser.profil === Role.ADMIN) {
      // Customer
      if (dto.customerId !== undefined) {
        if (dto.customerId === null) {
          opportunity.customer = null;
          opportunity.customerId = null;
        } else {
          const customer = await this.customerRepo.findOne({
            where: { id: dto.customerId },
          });
          if (!customer)
            throw new BadRequestException(
              `Customer ${dto.customerId} not found`,
            );
          opportunity.customer = customer;
        }
      }

      // User
      if (dto.userId !== undefined) {
        if (dto.userId === null) {
          opportunity.user = null;
          opportunity.userId = null;
        } else {
          const user = await this.userRepo.findOne({
            where: { id: dto.userId },
          });
          if (!user)
            throw new BadRequestException(`User ${dto.userId} not found`);
          opportunity.user = user;
        }
      }

      Object.assign(opportunity, dto);

      return this.opportunityRepo.save(opportunity);
    } else if (currentUser.profil === Role.MANAGER) {
      // 1. Le manager peut modifier seulement les opportunités :
      //    - dont il est owner
      //    - ou appartenant à un membre de son équipe
      const isHisOpportunity =
        opportunity.userId === currentUser.id ||
        opportunity.user?.managerId === currentUser.id;

      if (!isHisOpportunity) {
        throw new ForbiddenException(
          `You cannot update this opportunity: not in own by your team`,
        );
      }
      const newOwnerId = dto.userId ?? opportunity.userId;
      if (dto.userId) {
        const newOwner = await this.userService.findOne(dto.userId);
        if (!newOwner) {
          throw new NotFoundException(`User with id ${dto.userId} not found`);
        }

        const isEligible =
          newOwner.id === currentUser.id ||
          newOwner.managerId === currentUser.id;

        if (!isEligible) {
          throw new ForbiddenException(
            `You cannot assign opportunity to user ${newOwner.id}: not in your team`,
          );
        }
      }

      const updated = this.opportunityRepo.merge(opportunity, {
        ...dto,
        userId: newOwnerId,
      });
      return await this.customerRepo.save(updated);
    } else if (currentUser.profil === Role.USER) {
      if (opportunity.userId !== currentUser.id) {
        throw new ForbiddenException(
          `You cannot update this opportunity: you are not the owner`,
        );
      }

      const updated = this.opportunityRepo.merge(opportunity, {
        ...dto,
        userId: currentUser.id,
      });

      return await this.opportunityRepo.save(updated);
    }
  }

  async remove(id: number): Promise<void> {
    const opp = await this.findOne(id);
    await this.opportunityRepo.remove(opp);
  }
}
