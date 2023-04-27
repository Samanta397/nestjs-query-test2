import {Field, GraphQLISODateTime, ID, ObjectType} from "@nestjs/graphql";
import {
  FilterableField,
  FilterableUnPagedRelation,
  IDField,
  PagingStrategies,
  QueryOptions
} from "@ptc-org/nestjs-query-graphql";
import {PermissionDto} from "../permission/permission.dto";
import {UserDto} from "../user/dto/user.dto";

@ObjectType("Role")
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
}
