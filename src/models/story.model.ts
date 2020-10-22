import { UserModel as User } from './users.model';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	ManyToMany,
	JoinTable,
} from 'typeorm';

import { Tag } from './tag.model';

@Entity()
export class Story extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: number;

	@Column()
	title: string;

	@Column()
	text: string;

	// @Column({ type: 'text', nullable: true, array: true })
	// tags: string[];

	@ManyToMany(() => Tag, (tag) => tag.stories)
	@JoinTable()
	tags: Tag[];

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

	@ManyToOne(() => User, (creator) => creator.stories)
	creator: User;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
