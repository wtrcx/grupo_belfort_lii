import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import fs from 'fs';
import FileDTO from '@dtos/fileDTO';

class EmailService {
  private readonly replyTo: string;

  private readonly from: string;

  private readonly password: string | undefined;

  constructor(replyTo: string, from: string) {
    this.replyTo = replyTo;
    this.from = from;
    this.password = process.env.GOOGLE_PASSWORD;
  }

  public async send(
    to: string,
    subject: string,
    text: string,
    attachment?: FileDTO,
  ): Promise<void> {
    if (this.password) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: this.from,
          pass: this.password,
        },
      });

      let mailOptions: Mail.Options;

      if (attachment) {
        mailOptions = {
          from: this.from,
          to,
          replyTo: this.replyTo,
          subject,
          text,
          attachments: [
            {
              filename: `curriculo.${attachment.extenstion}`,
              path: attachment.filePath,
            },
          ],
        };
        await transporter
          .sendMail(mailOptions)
          .catch(error => console.log(`NodeMailer: ${error}`));

        await fs.promises
          .unlink(attachment.filePath)
          .catch(error => console.log(error));
      } else {
        mailOptions = {
          from: this.from,
          to,
          replyTo: this.replyTo,
          subject,
          text,
        };
        transporter
          .sendMail(mailOptions)
          .then(ok => console.log(ok))
          .catch(error => console.log(error));
      }
    }
  }
}

export default EmailService;
