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
import { Story } from './story.model';
import { backcoverimage } from '../utils/helpers';
// name -> {firstname , lastname}
// profilecoverimage -> coverimage

@Entity()
export class UserModel extends BaseEntity implements User {
	@PrimaryGeneratedColumn('uuid')
	id: number;

	@Column({ nullable: true })
	email: string;

	@Column({ nullable: true, default: 'anonymous' })
	firstname: string;

	@Column({ nullable: true })
	lastname: string;

	@Column({ type: 'text' })
	username: string;

	@Column({ nullable: true })
	password: string;

	@Column('bool', { default: false })
	verified: boolean;

	@Column({ type: 'text', default: 'stuff', nullable: true })
	profileimage: string;

	@Column({ type: 'text', default: backcoverimage, nullable: true })
	coverimage: string;

	@Column('numeric', { default: 0 })
	role: number;

	@OneToMany(() => Story, (story) => story.creator)
	stories: Story[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
