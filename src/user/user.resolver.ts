import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import {UserDto} from "./dto/user.dto";
import {ConnectionType, CRUDResolver} from "@ptc-org/nestjs-query-graphql";
import {UserEntity} from "./dto/user.entity";
import {InjectQueryService, QueryService} from "@ptc-org/nestjs-query-core";
import {LdapService} from "@app/ldap";
import {UserConnection, UserQuery} from "./user.types";
import {CreateUserDto} from "./dto/user.input";

@Resolver(() => UserDto)
export class UserResolver extends CRUDResolver(UserDto,  {
  create: { disabled: true },
  update: { disabled: true },
  delete: { disabled: true },
  read: { many: {disabled: true} }
}) {
  constructor(
    @InjectQueryService(UserEntity) readonly service: QueryService<UserDto>, //UserEntity ?????????,
    private ldapService: LdapService
  ) {
    super(service);
  }

  @Mutation(() => UserDto)
  async createOneUser(@Args('user') user: CreateUserDto): Promise<UserDto> {
    user["uuid"] = await this.ldapService.createUser(user);
    return this.service.createOne(user)
  }

  @Query(() => UserConnection)
  async users(@Args() query: UserQuery): Promise<ConnectionType<UserDto>> {
    console.log(345345345345345345345345)

    return UserConnection.createFromPromise((q) => this.service.query(q), { ...query });
  }
}

