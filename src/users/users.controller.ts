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
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() payload) {
    console.log(payload);
    return this.usersService.create(createUserDto, payload);
  }

  @CheckAbilities({ action: Action.Read, subject: User })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @CheckAbilities({ action: Action.Read, subject: User })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() payload) {
    console.log(payload);
    return this.usersService.findOne(+id, payload);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() payload,
  ) {
    return this.usersService.update(+id, updateUserDto, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
