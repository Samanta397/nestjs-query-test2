import {forwardRef, Module} from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {RoleEntity} from "./role.entity";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {RoleDto} from "./role.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {WinstonLoggerModule} from "../logger/winstonLogger.module";
import {RoleService} from "./role.service";
import {PermissionModule} from "../permission/permission.module";


@Module({
  providers: [
    RoleService,
  ],
  imports: [
    forwardRef(() => PermissionModule),
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([RoleEntity])],
      resolvers: [
        {
          DTOClass: RoleDto,
          EntityClass: RoleEntity,
          guards: [JwtAuthGuard],

          // read: {one: {disabled: true}},
          // // create: {disabled: true},
          // delete: {disabled: true}
        }
      ],

    }),
    WinstonLoggerModule
  ],
  exports: [RoleService]
})
export class RoleModule {}
