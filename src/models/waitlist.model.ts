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
export class Waitlist extends BaseEntity implements User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true })
	email: string;

	@Column({ nullable: true, default: false })
	joined: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
