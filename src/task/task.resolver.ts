import {Args, Query, Resolver} from "@nestjs/graphql";
import {UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {
  AuthorizerFilter,
  AuthorizerInterceptor,
  CRUDResolver, OperationGroup,
} from "@ptc-org/nestjs-query-graphql";
import {Filter, InjectQueryService, QueryService} from "@ptc-org/nestjs-query-core";
import {TaskDto} from "./task.dto";
import {TaskEntity} from "./task.entity";
import {UserDto} from "../user/dto/user.dto";
import {UserService} from "../user/user.service";

@Resolver(() => TaskDto)
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuthorizerInterceptor(TaskDto))
export class TaskResolver extends CRUDResolver(TaskDto) {
  constructor(
    @InjectQueryService(TaskEntity) readonly taskService: QueryService<TaskDto>,
    private readonly userService: UserService,
  ) {
    super(taskService);
  }

  @Query(() => UserDto)
  async userByTaskId(
    @Args('id') id: number,
    @AuthorizerFilter({
      operationName: 'userByTaskId',
      operationGroup: OperationGroup.READ,
      readonly: true,
      many: false
    }) authFilter: Filter<UserDto>
    ): Promise<UserDto> {
    const task = await this.taskService.findById(id);

    return this.userService.getUser(task.userId)
  }

}