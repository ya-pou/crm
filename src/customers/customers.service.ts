import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from './entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Payload } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/roles/roles.guard';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(User)
    private readonly userService: UsersService,
    private paginationService: PaginationService,
  ) {}

  async create(dto: CreateCustomerDto, payload: Payload): Promise<Customer> {
    const currentUser = await this.userService.getCurrent(payload);
    if (currentUser.profil === Role.ADMIN) {
      const newCustomer = this.customerRepo.create({
        ...dto,
        userId: dto.userId ?? null, // admin peut assigner ou non
      });

      return await this.customerRepo.save(newCustomer);
    } else if (currentUser.profil === Role.MANAGER) {
      let ownerId = dto.userId;

      // Si pas d'owner défini → par défaut le manager lui-même
      if (!ownerId) ownerId = currentUser.id;

      // Vérifier que ownerId existe
      const owner = await this.userService.findOne(ownerId);
      if (!owner) {
        throw new NotFoundException(`User with id ${ownerId} not found`);
      }

      // Vérifier que owner appartient à l'équipe du manager
      if (owner.id !== currentUser.id && owner.managerId !== currentUser.id) {
        throw new ForbiddenException(
          `You cannot assign this customer to user ${owner.id}. This user is not in your team.`,
        );
      }

      const newCustomer = this.customerRepo.create({
        ...dto,
        userId: owner.id,
      });

      return await this.customerRepo.save(newCustomer);
    } else if (currentUser.profil === Role.USER) {
      const newCustomer = this.customerRepo.create({
        ...dto,
        userId: currentUser.id, // force owner
      });

      return await this.customerRepo.save(newCustomer);
    }

    throw new ForbiddenException(
      "You don't have permission to create customers.",
    );
  }

  findAll(): Promise<Customer[]> {
    return this.customerRepo.find({
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  async findAllFiltered(query) {
    const qb = this.customerRepo
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .addSelect('u.id')
      .addSelect('u.name')
      .addSelect('u.lastName');

    return await this.paginationService.paginate(qb, query, [
      'u.name',
      'u.lastName',
      'c.name',
      'c.lastName',
      'c.email',
    ]);
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

  async update(
    id: number,
    dto: UpdateCustomerDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: Payload,
  ): Promise<Customer> {
    const currentUser = await this.userService.getCurrent(payload);

    // 2. Charger le customer existant avec owner
    const customer = await this.customerRepo.findOne({
      where: { id },
      relations: ['user'], // pour savoir qui est l’owner actuel
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    // --- ADMIN ---
    if (currentUser.profil === Role.ADMIN) {
      // ADMIN fait ce qu'il veut
      const newOwnerId = dto.userId ?? customer.userId;

      // Vérifier que l'owner existe si fourni
      if (dto.userId) {
        const newOwner = await this.userService.findOne(dto.userId);
        if (!newOwner) {
          throw new NotFoundException(`User with id ${dto.userId} not found`);
        }
      }

      const updated = this.customerRepo.merge(customer, {
        ...dto,
        userId: newOwnerId,
      });

      return await this.customerRepo.save(updated);
    }

    // --- MANAGER ---
    if (currentUser.profil === Role.MANAGER) {
      // 1. Le manager peut modifier seulement les customers :
      //    - dont il est owner
      //    - ou appartenant à un membre de son équipe
      const isHisCustomer =
        customer.userId === currentUser.id ||
        customer.user?.managerId === currentUser.id;

      if (!isHisCustomer) {
        throw new ForbiddenException(
          `You cannot update this customer: not in your team.`,
        );
      }

      // 2. Si le manager change l’owner : vérifier la nouvelle cible
      const newOwnerId = dto.userId ?? customer.userId;

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
            `You cannot assign customer to user ${newOwner.id}: not in your team.`,
          );
        }
      }

      const updated = this.customerRepo.merge(customer, {
        ...dto,
        userId: newOwnerId,
      });

      return await this.customerRepo.save(updated);
    }

    // --- USER ---
    if (currentUser.profil === Role.USER) {
      // User peut modifier seulement ses customers
      if (customer.userId !== currentUser.id) {
        throw new ForbiddenException(
          `You cannot update this customer: you are not the owner.`,
        );
      }

      // Un user ne peut PAS changer l’owner
      const updated = this.customerRepo.merge(customer, {
        ...dto,
        userId: currentUser.id, // owner ne change pas
      });

      return await this.customerRepo.save(updated);
    }

    throw new ForbiddenException('You do not have rights to update customers.');
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepo.remove(customer);
  }
}
