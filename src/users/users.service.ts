import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Action, CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Role } from 'src/roles/roles.guard';
import { Payload } from 'src/auth/auth.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
//TODO: Gestion du flag actif
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private pagination: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto, payload: Payload): Promise<User> {
    const currentUser = await this.getCurrent(payload);

    //Un manager ne peut créer que des users et pour lui (managerId)
    if (currentUser.profil === Role.MANAGER) {
      if (createUserDto.profil && createUserDto.profil != Role.USER) {
        throw new ForbiddenException(
          `Managers can only create users with profil 'user'`,
        );
      }

      createUserDto.managerId = currentUser.id;
    }

    const newUser = this.userRepository.create({
      ...createUserDto,
    });

    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(createUserDto.password, salt);

    return await this.userRepository.save(newUser);
  }

  async findAll(query) {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .leftJoin('u.manager', 'm')
      .addSelect('m.id')
      .addSelect('m.name')
      .addSelect('m.lastName');

    return await this.pagination.paginate(qb, query, [
      'u.name',
      'u.lastName',
      'u.email',
    ]);
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['manager'],
    });
    if (!user) throw new NotFoundException();
    return user;
  }

  async findOneByMail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ?? null;
  }

  async update(id: number, updateUserDto: UpdateUserDto, payload: Payload) {
    const currentUser = await this.getCurrent(payload);
    const user = await this.userRepository.findOne({ where: { id } });
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (!ability.can(Action.Update, user)) {
      throw new ForbiddenException('You cannot read this user.');
    }
    // On supprime le champ password du DTO s'il existe
    delete (updateUserDto as any).password;

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async getCurrent(user: any) {
    const current = await this.userRepository.findOne({
      where: { id: user.id },
      select: { id: true, profil: true, managerId: true },
    });
    if (!current) throw new UnauthorizedException();
    return current;
  }

  isManagerOf(manager: User, user: User): boolean {
    return user.managerId === manager.id;
  }
}
