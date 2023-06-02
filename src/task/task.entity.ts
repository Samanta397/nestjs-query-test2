import {
  Column,
  Entity, JoinColumn,
  ManyToOne, ObjectType,
  PrimaryGeneratedColumn,
} from "typeorm";
import {UserEntity} from "../user/dto/user.entity";

@Entity()
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({ nullable: false })
  userId!: string;

  @ManyToOne(
    (): ObjectType<UserEntity> => UserEntity,
    user => user.tasks,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn()
  user!: UserEntity;
}
