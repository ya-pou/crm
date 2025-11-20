import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.guard';

export const ROLES_KEY = 'profil';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
