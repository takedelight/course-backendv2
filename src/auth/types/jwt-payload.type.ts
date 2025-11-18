import { UserRole } from 'src/user/entities/user.entity';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}
