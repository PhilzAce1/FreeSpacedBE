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
import { UserModel as User } from './users.model';
import { Comment } from './comment.model';
import { Reports } from './reports.model';

@Entity()
export class Reply extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	content: string;

	@Column()
	creatorId: string;
	@ManyToOne(() => User, (creator) => creator.replies, {
		nullable: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	creator: User;

	@Column()
	commentId: string;
	@ManyToOne(
		() => Comment,
		(comment) => comment.replies,

		{
			onDelete: 'CASCADE',
			nullable: true,
		}
	)
	@JoinTable()
	comment: Comment;

	@OneToMany(
		() => Reports,
		(reports) => reports.reply,

		{
			onDelete: 'CASCADE',
			nullable: true,
		}
	)
	@JoinTable()
	reports: Reports[];

	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
