import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../interfaces/users.interface';
import { Story } from './story.model'
@Entity()
export class UserModel extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  username: string;

  @Column('bool', { default: false })
  verified: boolean
  @Column('numeric', { default: 0 })
  role: number;


  @OneToMany(() => Story, (story) => story.creator)
  stories: Story[]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
