import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../interfaces/users.interface';
@Entity()
export class userReModel extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column('numeric', { default: 0 })
  role: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// // password: q1w2e3r4
const userModel: User[] = [
  {
    id: 1,
    email: 'lim@gmail.com',
    password: '$2b$10$hmrwtGwC.QlfWt6YWaT3S.FP9CarS3.V9n3Qr.d9y2ovcan0oxs56',
  },
  {
    id: 2,
    email: 'kim@gmail.com',
    password: '$2b$10$hmrwtGwC.QlfWt6YWaT3S.FP9CarS3.V9n3Qr.d9y2ovcan0oxs56',
  },
  {
    id: 3,
    email: 'park@gmail.com',
    password: '$2b$10$hmrwtGwC.QlfWt6YWaT3S.FP9CarS3.V9n3Qr.d9y2ovcan0oxs56',
  },
  {
    id: 4,
    email: 'choi@gmail.com',
    password: '$2b$10$hmrwtGwC.QlfWt6YWaT3S.FP9CarS3.V9n3Qr.d9y2ovcan0oxs56',
  },
];

export default userModel;
