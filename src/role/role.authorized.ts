import {AuthorizationContext, CustomAuthorizer} from "@ptc-org/nestjs-query-graphql";
import {UserContext} from "../auth/auth.interfaces";
import {RoleDto} from "./role.dto";
import {Injectable, ForbiddenException} from "@nestjs/common";

@Injectable()
export class RoleAuthorizer implements CustomAuthorizer<RoleDto> {

  authorize(context: UserContext, authorizationContext?: AuthorizationContext) {
    const userScopes = context.req.userData.scopes;

    if (authorizationContext?.operationGroup === 'read' && userScopes.includes('role.read')) {
      return Promise.resolve({} );
    }

    if (authorizationContext?.operationGroup === 'update' && userScopes.includes('role.read')) {
      return Promise.resolve({} );
    }

    // return Promise.resolve({id < 1});
    return Promise.reject(new ForbiddenException());
  }



  // authorizeRelation(relationName: string, context: UserContext): Promise<Filter<unknown> | undefined> {
  //   if (relationName === 'permissions') {
  //     return Promise.resolve({ userId: { eq: context.req.user.id } });
  //   }
  //   return Promise.resolve(undefined);
  // }
}

