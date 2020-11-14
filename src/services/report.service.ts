import { Reports } from '../models/reports.model';

class ReportService {
	public report = Reports;
	public async init() {
		return 'Report Route Working';
	}
}
export default ReportService;
