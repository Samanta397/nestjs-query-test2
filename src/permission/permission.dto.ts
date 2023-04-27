import {Field, GraphQLISODateTime, ID, ObjectType} from "@nestjs/graphql";
import {
  FilterableField,
  FilterableUnPagedRelation,
  IDField,
  PagingStrategies,
  QueryOptions
} from "@ptc-org/nestjs-query-graphql";
import {RoleDto} from "../role/role.dto";
import {UserDto} from "../user/dto/user.dto";

@ObjectType("Permission")
@FilterableUnPagedRelation('roles', () => RoleDto)
@FilterableUnPagedRelation('users', () => UserDto)
@QueryOptions({ pagingStrategy: PagingStrategies.OFFSET })
export class PermissionDto {
  @IDField(() => ID)
  id!: number;

  @FilterableField()
  name!: string;

  @Field(() => GraphQLISODateTime)
  created!: Date;

  @Field(() => GraphQLISODateTime)
  updated!: Date;
}
