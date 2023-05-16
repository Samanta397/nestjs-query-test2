import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import {UserDto} from "./dto/user.dto";
import {
  Authorizer,
  AuthorizerFilter,
  AuthorizerInterceptor,
  CRUDResolver, InjectAuthorizer, OperationGroup,
} from "@ptc-org/nestjs-query-graphql";
import {UserEntity} from "./dto/user.entity";
import {Filter, InjectQueryService, QueryService} from "@ptc-org/nestjs-query-core";
import {CreateUserDto} from "./dto/user.input";
import {UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ScopesAuthGuard} from "./scopes_auth.guard";

@Resolver(() => UserDto)
// check authorize for custom methods
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuthorizerInterceptor(UserDto))
export class UserResolver extends CRUDResolver(UserDto, {
  read: {one: {disabled:true}},
  // create: { disabled: true },
  delete: { disabled: true }
}) {
  constructor(
    @InjectQueryService(UserEntity) readonly service: QueryService<UserDto>,
  ) {
    super(service);
  }


  @Query(() => UserDto)
  // @UseGuards(new ScopesAuthGuard(['user.read']))
  async user(
    @Args('id') id: number,
    @AuthorizerFilter({
      operationName: 'user',
      operationGroup: OperationGroup.READ,
      readonly: true,
      many: false
    }) authFilter: Filter<UserDto>
    ): Promise<UserDto> {
    return this.service.findById(id);

  }

  @Mutation(() => UserDto)
  async createOneUser(@Args('user') user: CreateUserDto): Promise<UserDto> {
    return this.service.createOne(user)
  }


}

