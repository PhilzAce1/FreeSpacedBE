import {
	BaseEntity,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	// OneToOne,
	JoinTable,
	Column,
	ManyToOne,
} from 'typeorm';
import { Story } from './story.model';

@Entity()
export class QuoteStory extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/**----------------------Quoted Story--------------- */
	@Column({ nullable: true })
	quoteId: string;

	@ManyToOne(() => Story, (story) => story.quote, {
		onUpdate: 'CASCADE',
		nullable: true,
		onDelete: 'CASCADE',
	})
	@JoinTable()
	quote: Story;

	/**------------------Main Story------------------------ */
	@Column({ nullable: true })
	storyId: string;

	@ManyToOne(() => Story, (quote) => quote.story, {
		onUpdate: 'CASCADE',
		nullable: true,
		onDelete: 'CASCADE',
	})
	@JoinTable()
	story: Story;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
