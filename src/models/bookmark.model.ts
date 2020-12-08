/**===============External Dependenices============================ */
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**Entities */
import { Story } from './story.model';
import { UserModel as User } from './users.model';

@Entity()
export class Bookmark extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true })
	creatorId: string;

	@ManyToOne(() => User, (creator) => creator.bookmarks, {
		nullable: true,
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinTable()
	creator: User;

	@Column({ nullable: true })
	storyId: string;
	@ManyToOne(() => Story, (story) => story.bookmarks, {
		nullable: true,
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	story: Story;

	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt;
}
