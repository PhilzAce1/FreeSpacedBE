import { v4 } from 'uuid';

interface contributors {
	profileimage: string;
	username: string;
}
export const username = 'Anon' + v4();
export const backcoverimage =
	'https://images.pexels.com/photos/261055/pexels-photo-261055.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500';

export function genSlug(name: string) {
	const randomInt = Math.floor(1000 + Math.random() * 900).toString();
	const preSlug = `${name} ${randomInt}`;
	const slug = preSlug
		.replace(/[^\w\s]/gi, '')
		.replace(/\s+/g, '-')
		.toLowerCase();
	return slug;
}

export function mapContributors(storyArr) {
	return storyArr.map((story) => {
		const contributorArr: contributors[] = [];
		story.comments.forEach((comment) => {
			const { profileimage, username } = comment.creator;
			contributorArr.push({
				profileimage,
				username,
			});
		});
		const contributors = {
			allContributors: story.comments.length,
			contributorsProfile: contributorArr,
		};
		const { comments, ...filStory } = story;
		return {
			...filStory,
			contributors,
		};
	});
}

export function mapContributorsForBookmarkRes(data) {
	const prunedArr = data.map((bookmark) => {
		const { story } = bookmark;
		const { comments } = story;
		const storyComments = comments.map((comment) => {
			return {
				username: comment.creator.username,
				profileimage: comment.creator.profileimage,
			};
		});
		delete bookmark.story.comments;
		return {
			...bookmark,
			story: {
				...story,
				contributors: {
					allContributors: storyComments.length,
					contributorsProfile: storyComments,
				},
				creator: {
					username: story.creator.username,
					profileimage: story.creator.profileimage,
				},
			},
		};
	});
	return prunedArr;
}
