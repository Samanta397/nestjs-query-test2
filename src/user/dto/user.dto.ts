import {Field, ID, Int, ObjectType} from "@nestjs/graphql";
import {
  AuthorizationContext,
  Authorize,
  FilterableField,
  FilterableUnPagedRelation,
  IDField,
  PagingStrategies,
  QueryOptions
} from "@ptc-org/nestjs-query-graphql";
import {PermissionDto} from "../../permission/permission.dto";
import {RoleDto} from "../../role/role.dto";
import {UserAuthorizer} from "../user.authorizer";

@ObjectType('User')
@Authorize(UserAuthorizer)
@FilterableUnPagedRelation('permissions', () => PermissionDto, { update: { enabled: true }})
@FilterableUnPagedRelation('roles', () => RoleDto,{update: {enabled: true}})
@QueryOptions({ pagingStrategy: PagingStrategies.OFFSET })
export class UserDto {
  @IDField(() => ID)
  id!: number;

  @FilterableField()
  username!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  password!: string;
}
