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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly caslAbilityFactory: CaslAbilityFactory,
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
    const password = createUserDto.password;
    const saltOrRounds = 10;

    createUserDto.password = await bcrypt.hash(password, saltOrRounds);

    return await this.userRepository.save(newUser);
  }

  async findAll(payload: Payload) {
    const currentUser = await this.getCurrent(payload);
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    let users: User[] = [];

    // ADMIN → tout
    if (currentUser.profil === Role.ADMIN) {
      users = await this.userRepository.find();
    }

    // MANAGER → ses users
    else if (currentUser.profil === Role.MANAGER) {
      users = await this.userRepository.find({
        where: [{ managerId: currentUser.id }, { id: currentUser.id }],
      });
    }

    // USER → ses collègues (même manager) et son manager
    else if (currentUser.profil === Role.USER) {
      if (!currentUser.managerId) {
        users = [currentUser]; // fallback
      } else {
        users = await this.userRepository.find({
          where: [
            { managerId: currentUser.managerId, actif: true },
            { id: currentUser.managerId, actif: true },
          ],
        });
      }
    }

    // Validation CASL élément par élément
    return users.filter((user) => ability.can(Action.Read, user));
  }

  async findOne(id: number, payload: Payload): Promise<User | null> {
    const currentUser = await this.getCurrent(payload);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();

    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (ability.can(Action.Read, user)) return user;
    if (
      currentUser.profil === Role.MANAGER &&
      this.isManagerOf(currentUser, user)
    ) {
      return user;
    }

    throw new UnauthorizedException();
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
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  private async getCurrent(user) {
    const current = await this.userRepository.findOne({
      where: { id: user.id },
      select: { id: true, profil: true, managerId: true },
    });
    if (!current) throw new UnauthorizedException();
    return current;
  }

  private isManagerOf(manager: User, user: User): boolean {
    return user.managerId === manager.id;
  }
}
