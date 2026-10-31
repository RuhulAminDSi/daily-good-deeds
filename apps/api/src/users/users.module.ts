import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';

/** Profiles and preferences (COMPONENT_ARCHITECTURE §1). Endpoints arrive with T-P2-AUTH. */
@Module({ providers: [UsersRepository], exports: [UsersRepository] })
export class UsersModule {}
