import {Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {PermissionEntity} from "../permission/permission.entity";
import {RoleEntity} from "../role/role.entity";

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => RoleEntity, { cascade: true })
  @JoinTable()
  roles: RoleEntity[];

  @CreateDateColumn()
  created!: Date;
}
