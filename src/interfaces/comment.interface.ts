export interface Comment {
	id?: string;
	content: string;
	respondtoId?: string;
	creatorId: string;
	storyId: string;
}
