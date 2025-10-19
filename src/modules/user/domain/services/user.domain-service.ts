import { Injectable } from '@nestjs/common';
import { User, UserProps } from '../entity/user.entity';
import { UserRole } from '../value-object/user-role.enum';
import { UserState } from '../value-object/user-state.enum';

@Injectable()
export class UserDomainService {
  createNewUser(email: string, password: string, firstName?: string): User {
    const userProps: UserProps = {
      email,
      password,
      firstName,
      role: UserRole.USER,
      state: UserState.DISABLED, 
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = new User("id",userProps);
    user.create(); 
    return user;
  }

  /**
   * Promote user to admin
   */
  promoteToAdmin(user: User): User {
    user.props.role = UserRole.ADMIN;
    user.props.updatedAt = new Date();
    return user;
  }

  /**
   * Activate user account
   */
  activateUser(user: User): User {
    user.props.state = UserState.ACTIVE;
    user.props.updatedAt = new Date();
    return user;
  }

  /**
   * Disable user account
   */
  disableUser(user: User): User {
    user.props.state = UserState.DISABLED;
    user.props.updatedAt = new Date();
    return user;
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: User): boolean {
    return user.props.role === UserRole.ADMIN;
  }

  /**
   * Check if user is active
   */
  isActive(user: User): boolean {
    return user.props.state === UserState.ACTIVE;
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
