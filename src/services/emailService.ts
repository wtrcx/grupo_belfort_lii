import nodemailer from 'nodemailer';
import ejs from 'ejs';
import Mail from 'nodemailer/lib/mailer';
import fs from 'fs';
import FileDTO from '@dtos/fileDTO';
import BodyDTO from '@dtos/bodyDTO';

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
    body: BodyDTO,
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
          attachments: [
            {
              filename: `curriculo.${attachment.extenstion}`,
              path: attachment.filePath,
            },
          ],
        };

        if (body.type === 'html' && body.filePath) {
          mailOptions.html = await ejs
            .renderFile(body.filePath, body.data)
            .then(data => data);
        } else {
          mailOptions.text = body.text;
        }

        await transporter.sendMail(mailOptions).catch(error => {
          throw new Error(error);
        });

        await fs.promises
          .unlink(attachment.filePath)
          .catch(error => console.log(error));
      } else {
        mailOptions = {
          from: this.from,
          to,
          replyTo: this.replyTo,
          subject,
        };

        if (body.type === 'html' && body.filePath) {
          mailOptions.html = await ejs
            .renderFile(body.filePath, body.data)
            .then(data => data);
        } else {
          mailOptions.text = body.text;
        }

        transporter.sendMail(mailOptions).catch(error => {
          throw new Error(error);
        });
      }
    }
  }
}

export default EmailService;
