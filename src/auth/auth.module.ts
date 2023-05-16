import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UserModule } from '../user/user.module'
import { jwtConstants } from './auth.constants'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import {NestjsQueryGraphQLModule} from "@ptc-org/nestjs-query-graphql";

@Module({
  imports: [
    // UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }
    }),
    NestjsQueryGraphQLModule.forFeature({
      // import the persistence module for the TodoItemEntity and the SubTaskModule
      imports: [UserModule],
    }),
  ],

  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}