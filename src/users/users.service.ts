import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Action, CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const password = createUserDto.password;
    const saltOrRounds = 10;
    createUserDto.password = await bcrypt.hash(password, saltOrRounds);

    // Créer un nouvel utilisateur et y associer les groupes
    const newUser = this.userRepository.create({
      ...createUserDto,
    });
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number, currentUserPayload: User): Promise<User | null> {
    const currentUser = await this.getCurrent(currentUserPayload);
    const user = await this.getCurrent(currentUserPayload);
    const ability = this.caslAbilityFactory.createForUser(currentUser);

    if (!ability.can(Action.Read, user)) {
      throw new ForbiddenException('You cannot read this user.');
    }
    return user ?? null;
  }

  async findOneByMail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ?? null;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserPayload: any,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    const currentUser = await this.getCurrent(currentUserPayload);
    const ability = this.caslAbilityFactory.createForUser(currentUser);
    if (!ability.can(Action.Update, user)) {
      throw new ForbiddenException('You cannot read this user.');
    }
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
    return await this.userRepository.findOne({
      where: { id: user.sub },
      select: { id: true, profil: true },
    });
  }
}
