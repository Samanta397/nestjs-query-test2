import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { UserModule } from './user/user.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import {AuthModule} from "./auth/auth.module";
import {UserScopesMiddleware} from "./middlewares/userScopes.middleware";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      database: 'test_db',
      username: 'root',
      password: 'root',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserScopesMiddleware)
      .forRoutes('graphql');
  }
}
