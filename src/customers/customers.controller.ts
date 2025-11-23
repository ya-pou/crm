import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Action } from 'src/casl/casl-ability.factory';
import { CheckAbilities } from 'src/casl/check-abilities.decorator';
import { Customer } from './entities/customer.entity';
import { CurrentUser } from 'src/users/current-user.decorator';
import { Payload } from 'src/auth/auth.service';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @CheckAbilities({ action: Action.Create, subject: Customer })
  @Post()
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() payload: Payload,
  ) {
    return this.customersService.create(createCustomerDto, payload);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);
  }

  @CheckAbilities({ action: Action.Update, subject: Customer })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() payload: Payload,
  ) {
    return this.customersService.update(+id, updateCustomerDto, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(+id);
  }
}
