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
    @InjectQueryService(UserEntity) readonly service: QueryService<UserDto>,
    private ldapService: LdapService
  ) {
    super(service);
  }

  @Mutation(() => UserDto)
  async createOneUser(@Args('user') user: CreateUserDto): Promise<UserDto> {
    const ldapUser = await this.ldapService.createUser(user);
    user['uuid'] = ldapUser['uidNumber'];
    return this.service.createOne(user)
  }

  @Mutation(() => UserDto)
  async updateUserByUUID(@Args('uuid', {type: () => Int}) uuid: number, @Args('updateObj') updateObj: UpdateUserDto) {
    const user =  await this.ldapService.updateUser(uuid, updateObj);
    console.log('update user by uui', user)
    return this.service.findById(1)
  }

  @Mutation(() => UserDto)
  async updateUserPassword(@Args('uuid', {type: () => Int}) uuid: number, @Args('password') password: string) {
    await this.ldapService.updateUserPassword(uuid, password);
    return this.service.findById(1)
  }

  @Mutation(() => UserDto)
  async deactivateUser(@Args('uuid', {type: () => Int}) uuid: number) {
    const groups = await this.ldapService.getUserGroups(uuid);
    const res = await this.ldapService.deactivateUser(uuid);
    console.log('user deactivated', res)
    return this.service.updateOne(2, {groups: groups.join(',')})
  }

  @Mutation(() => UserDto)
  async restoreUser(@Args('uuid', {type: () => Int}) uuid: number) {
    const user = await this.service.findById(2);
    const res = await this.ldapService.restoreUser(user.uuid, user.groups);
    console.log('user restored', res)
    return this.service.findById(2);
  }

  @Mutation(() => UserDto)
  async addUserPhoto(@Args('uuid', {type: () => Int}) uuid: number, @Args('url') url: string) {
    const res = await this.ldapService.addUserPhoto(uuid, url);
    // console.log('user restored', res)
    return this.service.findById(2);
  }

  @Mutation(() => UserDto)
  async deleteUserFromGroup(@Args('uuid', {type: () => Int}) uuid: number, @Args('groupName') groupName: string) {
    await this.ldapService.deleteUserFromGroup(uuid, groupName);
    return this.service.findById(1)
  }

  @Query(() => UserDto)
  async userByUUID(@Args('uuid', {type: () => Int}) uuid: number) {
    const user =  await this.ldapService.getUser(uuid);
    console.log('user by uui', user)
    return this.service.findById(1)
  }

  @Query(() => UserDto)
  async userGroups(@Args('uuid', {type: () => Int}) uuid: number) {
    const groups = await this.ldapService.getUserGroups(uuid);
    console.log('user by groups', groups)
    return this.service.findById(1)
  }

  @Query(() => UserDto)
  async groups() {
    const groups = await this.ldapService.getAllGroups();
    console.log('all groups', groups)
    return this.service.findById(1)
  }


  @Query(() => UserConnection)
  async users(@Args() query: UserQuery): Promise<ConnectionType<UserDto>> {
    return UserConnection.createFromPromise((q) => this.service.query(q), { ...query });
  }
}

