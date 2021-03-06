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
function getUniqueListBy(arr, key) {
	return [...new Map(arr.map((item) => [item[key], item])).values()];
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
		const filterdContributorsArr = getUniqueListBy(contributorArr, 'username');
		const contributors = {
			allContributors: filterdContributorsArr.length,
			contributorsProfile: filterdContributorsArr,
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
		const filterdContributorsArr = getUniqueListBy(storyComments, 'username');
		const getTagNames = getTagName(story.tags);
		return {
			...bookmark,
			story: {
				...story,
				contributors: {
					allContributors: filterdContributorsArr.length,
					contributorsProfile: filterdContributorsArr,
				},
				tags: getTagNames,
				creator: {
					username: story.creator.username,
					profileimage: story.creator.profileimage,
				},
			},
		};
	});
	return prunedArr;
}

export function getTagName(tags) {
	const newTagList: any[] = [];
	if (tags.length > 0) {
		for (const tagData of tags) {
			newTagList.push(tagData.name);
		}
	}
	return newTagList;
}
