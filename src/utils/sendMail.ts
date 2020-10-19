import sgMail from '@sendgrid/mail';
import { SEND_GRID_API_KEY } from '../config';
// interface Msg {
//   subject: string;
//   text: string;
//   html: string;
// }
export async function sendMessage(to: string, html: string): Promise<void> {
	sgMail.setApiKey(SEND_GRID_API_KEY);
	const msg = {
		to, // Change to your recipient
		from: 'akuagwuphilemon11@gmail.com', // Change to your verified sender
		subject: 'Sending with SendGrid is Fun',
		text: html,
		html: html,
	};

	sgMail
		.send(msg)
		.then(() => {
			console.log('Email sent');
		})
		.catch((error) => {
			console.error(error);
		});
}
