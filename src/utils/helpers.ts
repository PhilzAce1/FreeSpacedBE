import { v4 } from 'uuid';

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
