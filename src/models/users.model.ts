import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '../interfaces/users.interface';
import { Story } from './story.model';
import { backcoverimage } from '../utils/helpers';
import { ImageUrl } from '../config';

const imageFile = ImageUrl + 'one.png';

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

	@Column({ type: 'text', nullable: true })
	username: string;

	@Column({ nullable: true })
	password: string;

	@Column('bool', { default: false })
	verified: boolean;

	@Column({ type: 'text', default: imageFile, nullable: true })
	profileimage: string;

	@Column({ type: 'text', default: backcoverimage, nullable: true })
	coverimage: string;

	@Column('numeric', { default: 0 })
	role: number;

	@OneToMany(() => Story, (story) => story.creator)
	@JoinTable()
	stories: Story[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
