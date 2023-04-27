import {Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {RoleEntity} from "../role/role.entity";
import {UserEntity} from "../user/dto/user.entity";

@Entity()
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @ManyToMany(() => RoleEntity, role => role.permissions)
  roles: RoleEntity[];

  @ManyToMany(() => UserEntity, user => user.permissions)
  users: UserEntity[];

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;
}
