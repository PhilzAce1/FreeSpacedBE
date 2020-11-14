import {
	BaseEntity,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	OneToOne,
	JoinTable,
	Column,
} from 'typeorm';
import { Story } from './story.model';

@Entity()
export class QuoteStory extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	/**----------------------Quoted Story--------------- */
	@Column({ nullable: true })
	quoteId: string;

	@OneToOne(() => Story, (story) => story.quote, {
		onUpdate: 'CASCADE',
		nullable: true,
	})
	@JoinTable()
	quote: Story;

	/**------------------Main Story------------------------ */
	@Column({ nullable: true })
	storyId: string;

	@OneToOne(() => Story, (quote) => quote.story, {
		onUpdate: 'CASCADE',
		nullable: true,
	})
	@JoinTable()
	story: Story;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
