import { Module } from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {UserEntity} from "./user.entity";
import {UserDto} from "./user.dto";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      // import the NestjsQueryTypeOrmModule to register the entity with typeorm
      // and provide a QueryService
      imports: [NestjsQueryTypeOrmModule.forFeature([UserEntity])],
      // describe the resolvers you want to expose
      resolvers: [
        {
          EntityClass: UserEntity,
          DTOClass: UserDto,
        },
      ],
    }),
  ],
})

export class UserModule {}
