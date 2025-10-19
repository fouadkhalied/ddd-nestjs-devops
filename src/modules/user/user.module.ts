import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { UserController } from './api/rest/controller/user.controller';

// Repository
import { UserRepository } from './infrastructure/persistence/user.repository';
import { UserMapper } from './infrastructure/mapper/user.mapper';

// Command Handlers
import { UpdateProfileHandler } from './application/handler/command/update-profile.handler';
import { MakeUserAdminHandler } from './application/handler/command/make-user-admin.handler';
import { DeleteUserHandler } from './application/handler/command/delete-user.handler';
import { AddCreditHandler } from './application/handler/command/add-credit.handler';

// Query Handlers
import { GetUserHandler } from './application/handler/query/get-user.handler';
import { GetUsersHandler } from './application/handler/query/get-users.handler';
import { GetProfileHandler } from './application/handler/query/get-profile.handler';
import { GetDashboardStatsHandler } from './application/handler/query/get-dashboard-stats.handler';
import { GetAdminDashboardStatsHandler } from './application/handler/query/get-admin-dashboard-stats.handler';

// Tokens
import { USER_REPOSITORY } from './user.tokens';

const CommandHandlers = [
  UpdateProfileHandler,
  MakeUserAdminHandler,
  DeleteUserHandler,
  AddCreditHandler,
];

const QueryHandlers = [
  GetUserHandler,
  GetUsersHandler,
  GetProfileHandler,
  GetDashboardStatsHandler,
  GetAdminDashboardStatsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [
    UserMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}