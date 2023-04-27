import {Args, Int, Mutation, Query, Resolver} from "@nestjs/graphql";
import {UserDto} from "./dto/user.dto";
import {ConnectionType, CRUDResolver} from "@ptc-org/nestjs-query-graphql";
import {UserEntity} from "./dto/user.entity";
import {InjectQueryService, QueryService} from "@ptc-org/nestjs-query-core";
import {LdapService} from "@app/ldap";
import {UserConnection, UserQuery} from "./user.types";
import {CreateUserDto} from "./dto/user.input";
import {UpdateUserDto} from "./dto/user-update.input";

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

  @Mutation(() => UserDto)
  async updateUserByUUID(@Args('uuid', {type: () => Int}) uuid: number, @Args('updateObj') updateObj: UpdateUserDto) {
    const user =  await this.ldapService.updateUserByUUID(uuid, updateObj);
    console.log('user by uui', user)
    return this.service.findById(1)
  }

  @Query(() => UserDto)
  async userUserByUUID(@Args('uuid', {type: () => Int}) uuid: number) {
    const user =  await this.ldapService.getUserByUUID(uuid);
    console.log('user by uui', user)
    return this.service.findById(1)
  }

  @Query(() => UserConnection)
  async users(@Args() query: UserQuery): Promise<ConnectionType<UserDto>> {
    return UserConnection.createFromPromise((q) => this.service.query(q), { ...query });
  }
}

