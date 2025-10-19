import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entity/user.entity';
import { UserRole } from '../../domain/value-object/user-role.enum';
import { UserState } from '../../domain/value-object/user-state.enum';

@Injectable()
export class UserMapper {
  toDomain(raw: any): User {
    return new User(raw.id, {
      email: raw.email,
      password: raw.password || '',
      firstName: raw.username || undefined,
      lastName: undefined,
      role: raw.role as UserRole,
      state: raw.verified ? UserState.ACTIVE : UserState.DISABLED,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  toPersistence(user: User): any {
    return {
      id: user.id,
      email: user.props.email,
      password: user.props.password,
      username: user.props.firstName || null,
      role: user.props.role,
      verified: user.props.state === UserState.ACTIVE,
      createdAt: user.props.createdAt,
      updatedAt: user.props.updatedAt,
    };
  }

  toDto(user: User) {
    return {
      id: user.id,
      email: user.props.email,
      firstName: user.props.firstName,
      lastName: user.props.lastName,
      role: user.props.role,
      state: user.props.state,
      createdAt: user.props.createdAt,
      updatedAt: user.props.updatedAt,
    };
  }
}