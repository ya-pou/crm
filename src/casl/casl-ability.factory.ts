import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
  mongoQueryMatcher,
  fieldPatternMatcher,
} from '@casl/ability';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/roles.guard';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
type Subjects = InferSubjects<typeof User> | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      PureAbility<[Action, Subjects]>
    >(PureAbility as AbilityClass<AppAbility>);

    //
    // ADMIN
    //
    if (user.profil === Role.ADMIN) {
      can(Action.Manage, 'all');
      return build({
        detectSubjectType: (item) =>
          item.constructor as ExtractSubjectType<Subjects>,
        conditionsMatcher: mongoQueryMatcher,
        fieldMatcher: fieldPatternMatcher,
      });
    }

    //
    // MANAGER
    //
    if (user.profil === Role.MANAGER) {
      // Peut gérer ses propres informations
      can(Action.Read, User, { id: user.id });
      can(Action.Update, User, { id: user.id });

      // Placeholder — à implémenter plus tard
      // eslint-disable-next-line
      can(Action.Manage, User, { managerId: user.id });
      return build({
        detectSubjectType: (item) =>
          item.constructor as ExtractSubjectType<Subjects>,
        conditionsMatcher: mongoQueryMatcher,
        fieldMatcher: fieldPatternMatcher,
      });
    }

    //
    // USER
    //
    if (user.profil === Role.USER) {
      // Peut se lire lui-même
      can(Action.Read, User, { id: user.id });
      can(Action.Update, User, { id: user.id });
      cannot(Action.Create, User);
      // Placeholder : pourra lire les users gérés par le même manager
      // eslint-disable-next-line
      // can(Action.Read, User, { managerId: user.managerId });

      // Idem : il pourra lire son manager
      // eslint-disable-next-line
      // can(Action.Read, User, { id: user.managerId });

      return build({
        detectSubjectType: (item) =>
          item.constructor as ExtractSubjectType<Subjects>,
        conditionsMatcher: mongoQueryMatcher,
        fieldMatcher: fieldPatternMatcher,
      });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
      conditionsMatcher: mongoQueryMatcher,
      fieldMatcher: fieldPatternMatcher,
    });
  }
}
