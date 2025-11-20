import { SetMetadata } from '@nestjs/common';
import { Action } from './casl-ability.factory';

export interface RequiredRule {
  action: Action;
  subject: any;
}

export const CHECK_ABILITY_KEY = 'check_ability';
export const CheckAbilities = (...rules: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY_KEY, rules);
