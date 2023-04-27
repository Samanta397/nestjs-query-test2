import { Module } from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {UserEntity} from "./dto/user.entity";
import {UserDto} from "./dto/user.dto";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {UserResolver} from "./user.resolver";
import {LdapModule} from "@app/ldap";

@Module({
  providers: [UserResolver],
  imports: [
    LdapModule,
    NestjsQueryGraphQLModule.forFeature({
      // import the NestjsQueryTypeOrmModule to register the entity with typeorm
      // and provide a QueryService
      imports: [NestjsQueryTypeOrmModule.forFeature([UserEntity])],
      // describe the resolvers you want to expose
      resolvers: [
        {
          EntityClass: UserEntity,
          DTOClass: UserDto,
          create: {disabled: true},
          read: {disabled: true},
          update: { disabled: true },
          delete: { disabled: true },
        },
      ],
    }),
  ],
})

export class UserModule {}
