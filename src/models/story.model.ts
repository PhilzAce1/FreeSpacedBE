import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/** -------------------Relations ---------------------------- */
import { Bookmark } from './bookmark.model';
import { Comment } from './comment.model';
import { Tag } from './tag.model';
import { UserModel as User } from './users.model';
import { Reports } from './reports.model';
import { QuoteStory } from './quotestory.model';

@Entity()
export class Story extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true })
	title: string;

	@Column()
	text: string;

	@Column({ type: 'text', nullable: true })
	slug: string;

	@Column({ nullable: true, type: 'boolean', default: false })
	published: boolean;

	@OneToMany(() => Comment, (comment) => comment.story, {
		nullable: true,
		onDelete: 'CASCADE',
	})
	@JoinTable()
	comments: Comment[];

	@OneToMany(() => Reports, (report) => report.story, {
		nullable: true,
		onDelete: 'CASCADE',
	})
	@JoinTable()
	reports: Reports[];

	@OneToMany(() => Bookmark, (bookmarks) => bookmarks.story, {
		nullable: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	bookmarks: Bookmark[];

	@ManyToMany(() => Tag, (tag) => tag.stories, {
		nullable: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	tags: Tag[];

	@Column({ nullable: true })
	contributors: string;

	@Column({ nullable: true, default: 0 })
	views: number;

	@Column({ nullable: true })
	share: number;

	@Column({ nullable: true, default: false })
	is_spacecare: boolean;

	@Column({ nullable: true, default: true })
	allow_therapist: boolean;

	@Column()
	creatorId: string;

	@ManyToOne(() => User, (creator) => creator.stories, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinTable()
	creator: User;
	/**----------------------Quoted Story--------------- */

	@OneToOne(() => QuoteStory, (quote) => quote.story, {
		nullable: true,
	})
	@JoinTable()
	quote: QuoteStory;

	@OneToOne(() => QuoteStory, (quote) => quote.story, {
		nullable: true,
	})
	/**------------------Main Story------------------------ */
	@JoinTable()
	story: QuoteStory;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
