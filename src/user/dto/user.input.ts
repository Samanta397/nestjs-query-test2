import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @Field()
  username: string;

  @Field({nullable: true})
  firstName?: string;

  @Field({nullable: true})
  lastName?: string;

  @Field({nullable: true})
  password?: string;
}