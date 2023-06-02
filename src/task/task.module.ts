import { Module } from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {WinstonLoggerModule} from "../logger/winstonLogger.module";
import {TaskEntity} from "./task.entity";
import {TaskDto} from "./task.dto";
import {CreateTaskDto} from "./task.input";
import {UserModule} from "../user/user.module";
import {TaskResolver} from "./task.resolver";

@Module({
  providers: [TaskResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TaskEntity])],
      resolvers: [
        {
          DTOClass: TaskDto,
          CreateDTOClass: CreateTaskDto,
          EntityClass: TaskEntity,
          guards: [JwtAuthGuard],
          // read: {one: {disabled: true}},
          delete: {one: {disabled: true}}
        }
      ],

    }),
    UserModule,
    WinstonLoggerModule
  ]
})
export class TaskModule {}
