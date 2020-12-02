import {
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinTable,
} from 'typeorm';
import { UserModel } from './users.model';
import { Story } from './story.model';

export type notificationType =
	| 'comment'
	| 'comment_reply'
	| 'story_report'
	| 'comment_report'
	| 'reply_report'
	| 'story_comment_reply';
@Entity()
export class Notification extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	content: string;

	@Column()
	userId;

	@ManyToOne(() => UserModel, (user) => user.notifications)
	@JoinTable()
	user: UserModel;

	@Column({ nullable: true })
	actionuserId;

	@ManyToOne(() => UserModel, (actionuser) => actionuser.notificationactions, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		nullable: true,
	})
	@JoinTable()
	actionuser: UserModel;

	@Column({ nullable: true })
	storyId: string;

	@ManyToOne(() => Story, (story) => story.notifications, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		nullable: true,
	})
	story: Story;

	@Column({ default: false })
	read: boolean;

	@Column()
	type: notificationType;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
