import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core'

import { AuthenticatedUser, JwtPayload } from './auth.interfaces'
import { LoginResponseDto } from './dto/login-response.dto'
import {UserDto} from "../user/dto/user.dto";
import {UserEntity} from "../user/dto/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectQueryService(UserEntity) readonly usersService: QueryService<UserEntity>,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<AuthenticatedUser | null> {
    const [user] = await this.usersService.query({ filter: { username: { eq: username } }, paging: { limit: 1 } })
    // dont use plain text passwords in production!
    if (user && user.password === pass) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async currentUser(authUser: AuthenticatedUser): Promise<UserDto> {
    try {
      return await this.usersService.getById(authUser.id)
    } catch (e) {
      throw new UnauthorizedException()
    }
  }

  login(user: AuthenticatedUser): Promise<LoginResponseDto> {
    const payload: JwtPayload = { username: user.username, sub: user.id } //sub: user.id
    return Promise.resolve({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      accessToken: this.jwtService.sign(payload)
    })
  }
}