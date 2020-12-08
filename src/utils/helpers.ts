import { v4 } from 'uuid';

interface contributors {
	profileimage: string;
	username: string;
}
export const username = 'Anon' + v4();
export const backcoverimage =
	'https://images.pexels.com/photos/261055/pexels-photo-261055.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500';

/**
 *
 * @param name
 * GenSlug is function that generate Story Slug
 * e.g title-randomnumbers
 */
export function genSlug(name: string) {
	/**
	 * randomInt -> Generate a random int from 0000 - 9999
	 * preSlug -> joining name with random int
	 * slug -> convert "some title" to "some-title-0022"
	 */
	const randomInt = Math.floor(1000 + Math.random() * 900).toString();
	const preSlug = `${name} ${randomInt}`;
	const slug = preSlug
		.replace(/[^\w\s]/gi, '')
		.replace(/\s+/g, '-')
		.toLowerCase();
	return slug;
}

/**
 *
 * @param arr
 * @param key
 * Removing duplicate objects in an array
 */
function getUniqueListBy(arr, key) {
	return [...new Map(arr.map((item) => [item[key], item])).values()];
}

/**
 *
 * @param storyArr
 * mapContibutors to story array
 */
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
		const { comments, ...filStory } = story;
		const numberOfContributions = mapReplyCount(story);
		const contributors = {
			allContributors: filterdContributorsArr.length,
			contributorsProfile: filterdContributorsArr,
			numberOfContributions,
		};
		return {
			...filStory,
			contributors,
		};
	});
}

export function mapActionUser(arr) {
	return arr.map((data) =>
		data.actionuser
			? {
					...data,
					actionuser: {
						id: data.actionuser.id,
						username: data.actionuser.username,
						profileimage: data.actionuser.profileimage,
					},
			  }
			: { ...data, actionuser: {} }
	);
}
export function mapReplyCount(story) {
	if (story.comments.length > 0) {
		return story.comments
			.map((x) => (x.replies ? x.replies.length : 0))
			.reduce((a, b) => a + b + 1, 0);
	}
	return 0;
}
export function mapReplyCountArr() {}

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

/**
 *
 * @param tags -> Array of tag objects
 * Convert tag object arr to tag name array
 */
export function getTagName(tags) {
	const newTagList: any[] = [];
	if (tags.length > 0) {
		for (const tagData of tags) {
			newTagList.push(tagData.name);
		}
	}
	return newTagList;
}
