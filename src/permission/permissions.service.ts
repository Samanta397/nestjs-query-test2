import { Injectable } from '@nestjs/common'
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core'
import {PermissionEntity} from "./permission.entity";


@Injectable()
export class PermissionsService {
  constructor(
    @InjectQueryService(PermissionEntity) readonly permissionService: QueryService<PermissionEntity>,
  ) {}

  async getAdditionalInfo(id: number) {
    const permission = await this.permissionService.findById(id)
    return permission.name
  }

}