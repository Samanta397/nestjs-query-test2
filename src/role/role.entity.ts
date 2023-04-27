import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {PermissionEntity} from "../permission/permission.entity";
import {UserEntity} from "../user/dto/user.entity";

@Entity()
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => UserEntity, user => user.roles)
  users: UserEntity[];

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;
}
