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
import { Customer } from 'src/customers/entities/customer.entity';
import { Opportunity } from 'src/opportunities/entities/opportunity.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
type Subjects =
  | InferSubjects<typeof User>
  | typeof Customer
  | typeof Opportunity
  | 'all';

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
      // Rules for Users
      can(Action.Manage, User);
      // Rules for customers
      can(Action.Manage, Customer);
      //Rules for opportunities
      can(Action.Manage, Opportunity);

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
      // Rules for Users
      can(Action.Read, User);
      can(Action.Update, User, { id: user.id });
      can(Action.Create, User);
      can(Action.Manage, User, { managerId: user.id });

      // Rules for Customers
      can(Action.Create, Customer);
      can(Action.Read, Customer);
      can(Action.Update, Customer, { userId: user.id });

      //Rules for opportunities
      can(Action.Create, Opportunity);
      can(Action.Read, Opportunity);
      can(Action.Update, Opportunity, { userId: user.id });

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
      //Rules for users
      // Peut se lire lui-même
      can(Action.Read, User);
      //Peut mettre à jour son profil
      can(Action.Update, User, { id: user.id });
      //Peut voir les utilisateurs actifs qui ont le même manager que lui
      can(Action.Read, User, { managerId: user.managerId, actif: true });
      //Peut voir son manager
      can(Action.Read, User, { id: user.managerId });
      //Ne peut pas crée d'utisateur
      cannot(Action.Create, User);

      //Rules for customers
      can(Action.Read, Customer);
      can(Action.Update, Customer, { userId: user.id });
      can(Action.Create, Customer);

      //Rules for opportunities
      can(Action.Read, Opportunity);
      can(Action.Create, Opportunity);
      can(Action.Update, Opportunity, { userId: user.id });

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
