import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Story } from './story.model';

@Entity()
export class Tag extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@ManyToMany(() => Story, (story) => story.tags, {
		nullable: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	stories: Story[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
