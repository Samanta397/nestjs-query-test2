import {Field, ID, Int, ObjectType} from "@nestjs/graphql";
import {
  FilterableUnPagedRelation,
  IDField,
  PagingStrategies,
  QueryOptions
} from "@ptc-org/nestjs-query-graphql";
import {PermissionDto} from "../../permission/permission.dto";
import {RoleDto} from "../../role/role.dto";

@ObjectType('User')
@FilterableUnPagedRelation('permissions', () => PermissionDto)
@FilterableUnPagedRelation('roles', () => RoleDto,)
@QueryOptions({ pagingStrategy: PagingStrategies.OFFSET })
export class UserDto {
  @IDField(() => ID)
  id!: number;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  phone!: string;

  @Field(() => Int)
  uuid!: number;

  @Field()
  password!: string;
}
