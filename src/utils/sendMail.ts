import nodemailer from 'nodemailer';
export async function sendMessage(to: string, html: string) {
  let transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'ForSpams162@gmail.com', // generated ethereal user
      pass: 'philzpy162', // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: 'Somesender@philz.com', // sender address
    to: to, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: html, // plain text body
    html: `<b>${html}</b>`, // html body
  });
  console.log('email sent')
  // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
