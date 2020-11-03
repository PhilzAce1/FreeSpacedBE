import { Tag } from '../models/tag.model';
class TagService {
	private tag = Tag;

	public async getAllTags() {
		const tags = await this.tag.find();
		return tags;
	}
}
export default TagService;
