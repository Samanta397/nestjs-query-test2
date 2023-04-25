import {Field, GraphQLISODateTime, ID, ObjectType} from "@nestjs/graphql";
import {
  FilterableField,
  FilterableUnPagedRelation,
  IDField,
  PagingStrategies,
  QueryOptions
} from "@ptc-org/nestjs-query-graphql";
import {PermissionDto} from "../permission/permission.dto";
import {RoleDto} from "../role/role.dto";

@ObjectType('User')
@FilterableUnPagedRelation('permissions', () => PermissionDto)
@FilterableUnPagedRelation('roles', () => RoleDto,)
@QueryOptions({ pagingStrategy: PagingStrategies.OFFSET })
export class UserDto {
  @IDField(() => ID)
  id!: number;

  @FilterableField()
  username!: string;

  @FilterableField()
  email!: string;

  @Field(() => GraphQLISODateTime)
  created!: Date;

  @Field(() => GraphQLISODateTime)
  updated!: Date;
}
