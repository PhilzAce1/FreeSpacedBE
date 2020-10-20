import { UserModel as User } from './users.model';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Story extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	text: string;

	@Column({ nullable: true })
	tags: string[];

	@Column({ nullable: true })
	contributors: string;

	@Column({ nullable: true })
	views: number;

	@Column({ nullable: true })
	share: number;

	@Column({ nullable: true, default: false })
	is_spacecare: boolean;

	@Column({ nullable: true, default: true })
	allow_therapist: boolean;

	@Column()
	creatorId: number;

	@ManyToOne(() => User, (user) => user.stories)
	creator: User;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
