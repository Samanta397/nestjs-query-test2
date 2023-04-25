import { Module } from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {RoleEntity} from "./role.entity";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {RoleDto} from "./role.dto";


@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([RoleEntity])],
      resolvers: [{ DTOClass: RoleDto, EntityClass: RoleEntity }],
    }),
  ],
})
export class RoleModule {}
