import { Injectable } from '@nestjs/common'
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core'

import {UserEntity} from "./dto/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectQueryService(UserEntity) readonly userService: QueryService<UserEntity>,
  ) {}

  async getUser(id: number) {
    return this.userService.findById(id)
  }

}