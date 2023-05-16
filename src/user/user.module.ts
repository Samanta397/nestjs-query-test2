import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {UserEntity} from "./dto/user.entity";
import {UserDto} from "./dto/user.dto";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {UserResolver} from "./user.resolver";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {AuthModule} from "../auth/auth.module";
import {UserScopesMiddleware} from "../middlewares/userScopes.middleware";

// define the persistence module so it can be exported
const nestjsQueryTypeOrmModule = NestjsQueryTypeOrmModule.forFeature([UserEntity])

@Module({
  providers: [UserResolver],
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      // import it in the graphql module
      imports: [nestjsQueryTypeOrmModule],
      // describe the resolvers you want to expose
      resolvers: [
        {
          EntityClass: UserEntity,
          DTOClass: UserDto,
          // enableAggregate: true,
          // enableSubscriptions: true,

          // check authorize for default methods
          guards: [JwtAuthGuard],


          read: {disabled: true},
          // create: {disabled: true},
          // delete: {disabled: true}
        },
      ],
    }),
    // import it into the subTaskModule so it can be exported
    nestjsQueryTypeOrmModule,
  ],
  // export the persistence module, so it can be used by the TodoItemService
  exports: [nestjsQueryTypeOrmModule],
})

export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserScopesMiddleware)
      .forRoutes('*');
  }
}
