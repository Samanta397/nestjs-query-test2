import {Field, GraphQLISODateTime, ID, ObjectType} from "@nestjs/graphql";
import {
  Authorize,
  FilterableField,
  FilterableUnPagedRelation,
  IDField,
  PagingStrategies,
  QueryOptions
} from "@ptc-org/nestjs-query-graphql";
import {PermissionDto} from "../permission/permission.dto";
import {UserDto} from "../user/dto/user.dto";
import {RoleAuthorizer} from "./role.authorized";

@ObjectType("Role")
@Authorize(RoleAuthorizer)
@FilterableUnPagedRelation('permissions', () => PermissionDto)
@FilterableUnPagedRelation('users', () => UserDto)
@QueryOptions({ pagingStrategy: PagingStrategies.OFFSET })
export class RoleDto {
  @IDField(() => ID)
  id!: number;

  @FilterableField()
  name!: string;

  @Field(() => GraphQLISODateTime)
  created!: Date;

  @Field(() => GraphQLISODateTime)
  updated!: Date;

  userId: number;
}
