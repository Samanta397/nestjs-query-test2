import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {GqlExecutionContext} from "@nestjs/graphql";

@Injectable()
export class ScopesAuthGuard implements CanActivate {
  constructor(private requiredScopes: string[]) { }

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    const userScopes = ctx.getContext().req.userData.scopes

    return this.requiredScopes.every(scope =>
      userScopes.includes(scope),
    );
  }

}