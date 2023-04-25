import { Module } from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {PermissionEntity} from "./permission.entity";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {PermissionDto} from "./permission.dto";

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([PermissionEntity])],
      resolvers: [{ DTOClass: PermissionDto, EntityClass: PermissionEntity }],
    }),
  ],
})
export class PermissionModule {}
