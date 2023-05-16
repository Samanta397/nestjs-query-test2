import {UserEntity} from "../user/dto/user.entity";

export type AuthenticatedUser = Pick<UserEntity, 'id' | 'username'>
export type JwtPayload = {
  sub: number;
  username: string;
}

export type UserContext = {
  req: {
    user: AuthenticatedUser
    userData: {
      scopes: string[]
    }
  }
}