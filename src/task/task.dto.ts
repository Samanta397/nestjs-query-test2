import {Field, ID, ObjectType} from "@nestjs/graphql";
import {
  FilterableField, FilterableRelation,
  IDField,
  PagingStrategies,
  QueryOptions
} from "@ptc-org/nestjs-query-graphql";
import {UserDto} from "../user/dto/user.dto";

@ObjectType("Task")
@FilterableRelation('user', () => UserDto, { update: { enabled: true } })
@QueryOptions({ pagingStrategy: PagingStrategies.OFFSET })
export class TaskDto {
  @IDField(() => ID)
  id!: number;

  @FilterableField()
  name!: string;

  @Field()
  description!: string;

  @FilterableField(() => ID)
  userId!: number;
}