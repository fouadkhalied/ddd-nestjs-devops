// src/modules/user/api/rest/controller/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

// Guards & Decorators
import { AuthGuard } from '../../../../auth/api/guard/auth.guard';
import { AuthRoles } from '../../../../../libs/decorator/auth.decorator';

// DTOs
import { AddCreditDto } from '../dto/add-credit.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

// Commands
import { UpdateProfileCommand } from '../../../application/command/update-profile.command';
import { MakeUserAdminCommand } from '../../../application/command/make-user-admin.command';
import { DeleteUserCommand } from '../../../application/command/delete-user.command';
import { AddCreditCommand } from '../../../application/command/add-credit.command';

// Queries
import { GetUserQuery } from '../../../application/query/get-user.query';
import { GetUsersQuery } from '../../../application/query/get-users.query';
import { GetProfileQuery } from '../../../application/query/get-profile.query';
import { GetDashboardStatsQuery } from '../../../application/query/get-dashboard-stats.query';
import { GetAdminDashboardStatsQuery } from '../../../application/query/get-admin-dashboard-stats.query';

// Enums
import { ApiRole } from '../../../../../libs/api/api-role.enum';
import { RolesGuard } from 'src/modules/auth/api/guard/roles.guard';
import { CurrentUser } from 'src/libs/decorator/current-user.decorator';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.queryBus.execute(new GetProfileQuery(userId));
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.commandBus.execute(
      new UpdateProfileCommand(userId, dto.username, dto.password, dto.country),
    );
  }

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    return this.queryBus.execute(
      new GetDashboardStatsQuery(userId, days || 7),
    );
  }

  @Get('admin/dashboard')
  @UseGuards(RolesGuard)
  @AuthRoles(ApiRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAdminDashboardStats(@Query('days') days?: number) {
    return this.queryBus.execute(
      new GetAdminDashboardStatsQuery(days || 7),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get()
  @UseGuards(RolesGuard)
  @AuthRoles(ApiRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.queryBus.execute(new GetUsersQuery({ page, limit }));
  }

  @Post(':id/make-admin')
  @UseGuards(RolesGuard)
  @AuthRoles(ApiRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async makeUserAdmin(@Param('id') id: string) {
    return this.commandBus.execute(new MakeUserAdminCommand(id));
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @AuthRoles(ApiRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }

  @Post(':userId/add-credit')
  @UseGuards(RolesGuard)
  @AuthRoles(ApiRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async addCredit(
    @CurrentUser('id') adminId: string,
    @Param('userId') userId: string,
    @Body() dto: AddCreditDto,
  ) {
    return this.commandBus.execute(
      new AddCreditCommand(adminId, userId, dto.credit),
    );
  }
}