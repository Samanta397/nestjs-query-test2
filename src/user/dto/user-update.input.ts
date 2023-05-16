import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserDto {
  @Field({nullable: true})
  username?: string;

  @Field({nullable: true})
  firstName?: string;

  @Field({nullable: true})
  lastName?: string;
}