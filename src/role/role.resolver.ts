import {Args, Query, Resolver} from "@nestjs/graphql";
import {RoleDto} from "./role.dto";
import {UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {
  Authorizer,
  AuthorizerFilter,
  AuthorizerInterceptor,
  CRUDResolver,
  InjectAuthorizer
} from "@ptc-org/nestjs-query-graphql";
import {Filter, InjectQueryService, QueryService} from "@ptc-org/nestjs-query-core";
import {RoleEntity} from "./role.entity";
import {ScopesAuthGuard} from "../user/scopes_auth.guard";

@Resolver(() => RoleDto)
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuthorizerInterceptor(RoleDto))
export class RoleResolver extends CRUDResolver(RoleDto, {
  read:  {disabled:true},
  delete: {disabled: true},
}) {
  constructor(
    @InjectQueryService(RoleEntity) readonly roleService: QueryService<RoleDto>,
  ) {
    super(roleService);
  }

  @Query(() => RoleDto)
  @UseGuards(new ScopesAuthGuard(['role.read']))
  async role(@Args('id') id: number, @AuthorizerFilter() authFilter: Filter<RoleDto>): Promise<RoleDto> {
    return this.roleService.findById(id)
  }

  @Query(() => [RoleDto])
  @UseGuards(new ScopesAuthGuard(['role.read']))
  async roles(): Promise<RoleDto[]> {
    return this.roleService.query({});
  }
}