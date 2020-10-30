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
import { ImageUrl } from '../config';
import { User } from '../interfaces/users.interface';
import { backcoverimage } from '../utils/helpers';
import { Bookmark } from './bookmark.model';
import { Comment } from './comment.model';
import { Reply } from './reply.model';
import { Story } from './story.model';

const imageFile = ImageUrl + 'one.png';

@Entity()
export class UserModel extends BaseEntity implements User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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

	@OneToMany(() => Bookmark, (bookmarks) => bookmarks.creator, {
		nullable: true,
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	bookmarks: Bookmark[];

	@OneToMany(() => Comment, (comments) => comments.creator, {
		nullable: true,
	})
	@JoinTable()
	comments: Comment[];

	@OneToMany(() => Story, (story) => story.creator, {
		nullable: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	stories: Story[];

	@OneToMany(() => Reply, (replies) => replies.creator)
	@JoinTable()
	replies: Reply[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
