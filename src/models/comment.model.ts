import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**-----------------Relations ---------------- */
import { Comment as CommentInterface } from '../interfaces/comment.interface';
import { Story } from './story.model';
import { UserModel as User } from './users.model';
import { Reply } from './reply.model';
import { Reports } from './reports.model';
@Entity()
export class Comment extends BaseEntity implements CommentInterface {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	content: string;

	@Column()
	creatorId: string;
	@Column({ nullable: true, default: false })
	is_freespaace_therapist: true;
	@ManyToOne(() => User, (creator) => creator.comments, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	creator: User;

	@OneToMany(
		() => Reply,
		(replies) => replies.comment,

		{
			onDelete: 'CASCADE',
			nullable: true,
		}
	)
	@JoinTable()
	replies: Reply[];

	@OneToMany(
		() => Reports,
		(reports) => reports.comment,

		{
			onDelete: 'CASCADE',
			nullable: true,
		}
	)
	@JoinTable()
	reports: Reports[];

	@Column()
	storyId: string;
	@ManyToOne(() => Story, (story) => story.comments, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	story: Story;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
