import { Module } from '@nestjs/common';
import { LdapService } from './ldap.service';
import {ConfigModule} from "@nestjs/config";

@Module({
  providers: [LdapService],
  exports: [LdapService],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    })
  ]
})
export class LdapModule {}
