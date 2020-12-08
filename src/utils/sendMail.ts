import sgMail from '@sendgrid/mail';
import { SEND_GRID_API_KEY } from '../config';
import { emailtype, mailtemp } from './mailtemplate';
export async function sendMessage(
	to: string,
	typeofmail: emailtype,
	token: string
): Promise<void> {
	sgMail.setApiKey(SEND_GRID_API_KEY);
	const html = mailtemp(typeofmail, token);
	const subject = emailType(typeofmail);
	const msg = {
		to, // Change to your recipient
		from: 'Jacob From Freespaace <wonderful@freespaace.com>', // sender address
		// from: 'wonderful@freespaace.com', // Change to your verified sender
		subject: subject,
		// text: html,
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
/**-------------------Return Email Title----------------------------- */
function emailType(typeofmail: emailtype) {
	if (typeofmail === 'forgotpassword') {
		return `Reset Password`;
	} else if (typeofmail === 'verifyemail') {
		return `Verify Email`;
	} else {
		return 'Notification';
	}
}
