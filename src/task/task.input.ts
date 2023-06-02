import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTaskDto {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  userId: number;
}