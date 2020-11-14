import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**----------------------Relations--------------------- */
import { UserModel as User } from './users.model';
import { Story } from './story.model';
import { Comment } from './comment.model';
import { Reply } from './reply.model';
@Entity()
export class Reports extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true })
	complain: string;

	@Column()
	creatorId;

	@ManyToOne(() => User, (creator) => creator.reports, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		nullable: true,
	})
	creator: User;

	@Column({ nullable: true })
	storyId;

	@ManyToOne(() => Story, (story) => story.reports, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		nullable: true,
	})
	story: Story;

	@Column({ nullable: true })
	commentId;

	@ManyToOne(() => Comment, (story) => story.reports, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		nullable: true,
	})
	comment: Comment;

	@Column({ nullable: true })
	replyId;

	@ManyToOne(() => Reply, (reply) => reply.reports, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		nullable: true,
	})
	reply: Reply;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
