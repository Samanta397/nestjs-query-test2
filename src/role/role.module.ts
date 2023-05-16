import { Module } from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {RoleEntity} from "./role.entity";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {RoleDto} from "./role.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {RoleResolver} from "./role.resolver";


@Module({
  providers: [RoleResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([RoleEntity])],
      resolvers: [
        {
          DTOClass: RoleDto,
          EntityClass: RoleEntity,
          guards: [JwtAuthGuard],

          read: {disabled: true},
          // create: {disabled: true},
          delete: {disabled: true}
        }
      ],

    }),
  ],
})
export class RoleModule {}
