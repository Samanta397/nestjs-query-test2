import {ArgsType} from "@nestjs/graphql";
import {QueryArgsType} from "@ptc-org/nestjs-query-graphql";
import {UserDto} from "./user.dto";


@ArgsType()
export class UserQuery extends QueryArgsType(UserDto) {}
export const UserConnection = UserQuery.ConnectionType;