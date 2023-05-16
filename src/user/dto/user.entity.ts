import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {PermissionEntity} from "../../permission/permission.entity";
import {RoleEntity} from "../../role/role.entity";

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  password!: string;

  @ManyToMany(() => PermissionEntity, { cascade: true })
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => RoleEntity, { cascade: true })
  @JoinTable()
  roles: RoleEntity[];
}
