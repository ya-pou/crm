import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_ABILITY_KEY, RequiredRule } from './check-abilities.decorator';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rules =
      this.reflector.get<RequiredRule[]>(
        CHECK_ABILITY_KEY,
        context.getHandler(),
      ) ||
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY_KEY, context.getClass());

    if (!rules || rules.length === 0) {
      return true; // aucune règle CASL → accès autorisé
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const ability = this.abilityFactory.createForUser(user);

    for (const rule of rules) {
      if (!ability.can(rule.action, rule.subject)) {
        throw new ForbiddenException('Access denied by CASL');
      }
    }

    return true;
  }
}
