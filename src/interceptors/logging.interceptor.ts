import {CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor} from "@nestjs/common";
import {GqlExecutionContext} from "@nestjs/graphql";
import {WinstonLogger} from "../logger/winstonLogger.service";
import {tap} from "rxjs";
import {isQueryForMultipleEntity, isQueryForSimpleEntity, isRelationsMutation, relationsLogging} from "./helper";
import {PermissionsService} from "../permission/permissions.service";
import {RoleService} from "../role/role.service";


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionsService,
    @Inject(WinstonLogger) private readonly logger: WinstonLogger
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = GqlExecutionContext.create(context);
    const {path: {typename, key}} = ctx.getInfo(); // typename = query/mutation, key = query name

    const authUser = ctx.getContext().req.user;
    const response = JSON.stringify(context.switchToHttp().getResponse())

    return next
      .handle()
      .pipe(
        tap((data) => {
          // console.log(data)
          if (!authUser) {
            this.logger.audit(`Login. Payload: ${response}`)
          } else {

            //for "users", "roles", "permissions"
            if (isQueryForMultipleEntity(key) || key === 'userByTaskId') {
              this.logger.audit(`${authUser.username} did ${typename} ${key}. Payload: ${response}`)
            }

            //for "user", "role", "permission"
            if (isQueryForSimpleEntity(key)) {
              this.logger.audit(`${authUser.username} requested ${key} "${data.username || data.name}"`)
            }

            //createOneUser, updateOneUser, deleteOneUser
            if (key.includes('One')) {
              this.logger.audit(`${authUser.username} did ${typename} ${key}. Payload: ${response}`)
            }

            // addPermissionsToUser, setPermissionsOnUser, addRolesToUser, setRolesOnUser
            if (isRelationsMutation(key)) {
              relationsLogging(key, JSON.parse(response).input.relationIds, this.roleService, this.permissionService)
                .then(({entity, entityNames}) => {
                  this.logger.audit(`${authUser.username} added  ${entity} "${entityNames}"  to the user ${data.username}. Payload: ${response}`)
                })
            }

          }
        })
      );
  }

}

