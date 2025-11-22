import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckAbilities } from 'src/casl/check-abilities.decorator';
import { Action } from 'src/casl/casl-ability.factory';
import { User } from './entities/user.entity';
import { CurrentUser } from './current-user.decorator';

@ApiTags('Utilisateurs')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @CheckAbilities({ action: Action.Create, subject: User })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @CheckAbilities({ action: Action.Read, subject: User })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @CheckAbilities({ action: Action.Read, subject: User })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser) {
    return this.usersService.findOne(+id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser,
  ) {
    return this.usersService.update(+id, updateUserDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
