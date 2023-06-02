import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";
import {UserEntity} from "./dto/user.entity";
import {UserDto} from "./dto/user.dto";
import {NestjsQueryTypeOrmModule} from "@ptc-org/nestjs-query-typeorm";
import {UserResolver} from "./user.resolver";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UserScopesMiddleware} from "../middlewares/userScopes.middleware";
import {WinstonLoggerModule} from "../logger/winstonLogger.module";
import {LoggingInterceptor} from "../interceptors/logging.interceptor";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {RoleResolver} from "../role/role.resolver";
import {RoleService} from "../role/role.service";
import {RoleModule} from "../role/role.module";
import {PermissionModule} from "../permission/permission.module";
import {CreateUserDto} from "./dto/user.input";
import {UserService} from "./user.service";
import {TaskModule} from "../task/task.module";

// define the persistence module so it can be exported
const nestjsQueryTypeOrmModule = NestjsQueryTypeOrmModule.forFeature([UserEntity])

@Module({
  providers: [
    UserResolver,
    UserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  imports: [
    RoleModule,
    PermissionModule,
    NestjsQueryGraphQLModule.forFeature({
      // import it in the graphql module
      imports: [nestjsQueryTypeOrmModule],
      // describe the resolvers you want to expose
      resolvers: [
        {
          EntityClass: UserEntity,
          DTOClass: UserDto,
          CreateDTOClass: CreateUserDto,

          // check authorize for default methods
          guards: [JwtAuthGuard],


          // read: {disabled: true},
          // create: {disabled: true},
          // delete: {disabled: true}
        },
      ],
    }),
    // import it into the subTaskModule so it can be exported
    nestjsQueryTypeOrmModule,
    WinstonLoggerModule,
  ],
  exports: [nestjsQueryTypeOrmModule, UserService],
})

export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserScopesMiddleware)
      .forRoutes('*');
  }
}
