import {AuthorizationContext, CustomAuthorizer} from "@ptc-org/nestjs-query-graphql";
import {UserContext} from "../auth/auth.interfaces";
import {Injectable, ForbiddenException, Inject} from "@nestjs/common";
import {UserDto} from "./dto/user.dto";
import {Filter} from "@ptc-org/nestjs-query-core";

@Injectable()
export class UserAuthorizer implements CustomAuthorizer<UserDto> {

  authorize(context: UserContext, authorizationContext?: AuthorizationContext) {
    const userScopes = context.req.userData.scopes;

    if (authorizationContext?.operationGroup === 'read' && userScopes.includes('user.read')) {
      return Promise.resolve({} );
    }

    if (authorizationContext?.operationGroup === 'create' && userScopes.includes('user.create')) {
      return Promise.resolve({} );
    }

    if (authorizationContext?.operationGroup === 'update' && userScopes.includes('user.edit')) {
      return Promise.resolve({} );
    }

    return Promise.reject(new ForbiddenException());
  }



  authorizeRelation(relationName: string, context: UserContext, authorizationContext?: AuthorizationContext): Promise<Filter<unknown> | undefined> {
    const userScopes = context.req.userData.scopes;

    if (relationName === 'roles' && authorizationContext?.operationGroup === 'read' && userScopes.includes('role.read')) {
      return Promise.resolve({});
    }

    if (relationName === 'permissions' && authorizationContext?.operationGroup === 'read' && userScopes.includes('permission.read')) {
      return Promise.resolve({});
    }

    if (relationName === 'permissions' && authorizationContext?.operationGroup === 'update' && userScopes.includes('permission.edit')) {
      return Promise.resolve({});
    }

    if (relationName === 'roles' && authorizationContext?.operationGroup === 'update' && userScopes.includes('role.edit')) {
      return Promise.resolve({});
    }

    return Promise.resolve({id: {lt: 1}});
  }
}