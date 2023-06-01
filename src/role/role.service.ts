import { Injectable } from '@nestjs/common'
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core'

import {RoleEntity} from "./role.entity";

@Injectable()
export class RoleService {
  constructor(
    @InjectQueryService(RoleEntity) readonly roleService: QueryService<RoleEntity>,
  ) {}

  async getAdditionalInfo(id: number) {
    const role = await this.roleService.findById(id)
    return role.name
  }

}