import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserScopesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['userData'] = {
      scopes: ['user.read', 'user.create', 'user.edit', 'role.read', 'role.edit', 'permission.read',  'permission.edit'] //'role.read'
    }
    next();
  }
}
