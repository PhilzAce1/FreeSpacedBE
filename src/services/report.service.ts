import { Reports } from '../models/reports.model';
import { Story } from '../models/story.model';
import { ReportStoryDto } from '../dtos/report.dto';
import HttpException from '../exceptions/HttpException';

class ReportService {
	public report = Reports;
	public story = Story;
	public async init() {
		return 'Report Route Working';
	}
	public async reportStory(
		storyData: ReportStoryDto,
		userId: string
	): Promise<Reports> {
		const { storyId, complain } = storyData;
		const storyExist = await this.story.findOne({ where: { id: storyId } });

		if (!storyExist) throw new HttpException(404, 'Story does not exist');

		const reportStory = this.report
			.create({
				storyId,
				creatorId: userId,
				complain,
			})
			.save();
		return reportStory;
	}
}
export default ReportService;
