import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';

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
    UserModule,
    RoleModule,
    PermissionModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
