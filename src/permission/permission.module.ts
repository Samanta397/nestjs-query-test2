import {forwardRef, Module} from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {PermissionEntity} from "./permission.entity";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {PermissionDto} from "./permission.dto";
import {PermissionsService} from "./permissions.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {WinstonLoggerModule} from "../logger/winstonLogger.module";
import {RoleModule} from "../role/role.module";

@Module({
  providers: [
    PermissionsService,
  ],
  imports: [
    forwardRef(() => RoleModule),
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([PermissionEntity])],
      resolvers: [
        {
          DTOClass: PermissionDto,
          EntityClass: PermissionEntity,
          guards: [JwtAuthGuard],
        }
      ],

    }),
    WinstonLoggerModule
  ],
  exports: [PermissionsService]
})
export class PermissionModule {}
