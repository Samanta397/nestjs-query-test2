import {Args, Query, Resolver} from "@nestjs/graphql";
import {RoleDto} from "./role.dto";
import {UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {
  AuthorizerFilter,
  AuthorizerInterceptor,
  CRUDResolver,
} from "@ptc-org/nestjs-query-graphql";
import {Filter, InjectQueryService, QueryService} from "@ptc-org/nestjs-query-core";
import {RoleEntity} from "./role.entity";

@Resolver(() => RoleDto)
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuthorizerInterceptor(RoleDto))
export class RoleResolver extends CRUDResolver(RoleDto, {
  read:  {one: {disabled: true}},
  // delete: {disabled: true},
}) {
  constructor(
    @InjectQueryService(RoleEntity) readonly roleService: QueryService<RoleDto>,
  ) {
    super(roleService);
  }

  @Query(() => RoleDto)
  async role(@Args('id') id: number, @AuthorizerFilter() authFilter: Filter<RoleDto>): Promise<RoleDto> {
    return this.roleService.findById(id)
  }

  // @Query(() => RoleDto)
  // async getAdditionalInfo( @Args('id') id: number) {
  //   const role = await this.service.findById(id)
  //   return role.name
  // }

  // @Query(() => [RoleDto])
  // @UseGuards(new ScopesAuthGuard(['role.read']))
  // async roles(): Promise<RoleDto[]> {
  //   return this.roleService.query({});
  // }
}