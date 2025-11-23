import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/users/current-user.decorator';
import { Payload } from 'src/auth/auth.service';
import { CheckAbilities } from 'src/casl/check-abilities.decorator';
import { Action } from 'src/casl/casl-ability.factory';
import { Opportunity } from './entities/opportunity.entity';

@ApiTags('Opportunités')
@ApiBearerAuth('JWT-auth')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @CheckAbilities({ action: Action.Create, subject: Opportunity })
  @Post()
  create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @CurrentUser() payload: Payload,
  ) {
    return this.opportunitiesService.create(createOpportunityDto, payload);
  }

  @Get()
  findAll() {
    return this.opportunitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(+id);
  }

  @CheckAbilities({ action: Action.Update, subject: Opportunity })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @CurrentUser() payload: Payload,
  ) {
    return this.opportunitiesService.update(+id, updateOpportunityDto, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.opportunitiesService.remove(+id);
  }
}
