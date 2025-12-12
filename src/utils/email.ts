import { EMAIL_FROM, IS_PROD_ENV, VALKEY_URL } from "@/config";
import { createOtpEmailHtml } from "@/emails/otp";
import { Queue, Worker } from "bullmq";
import { Logger } from "logixlysia";
import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer";
import pino from "pino";

type EmailJobT = "email-verify";
type EmailVerifyDataT = Record<"name" | "email" | "otp", string> & { logger: Logger["pino"] }

const getTransporter = async () => {
    if (IS_PROD_ENV) {
        const transporter = createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "",
                pass: ""
            }
        })
        return transporter
    } else {
        const { pass, user } = await createTestAccount();
        const transporter = createTransport({
            debug: !IS_PROD_ENV,
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user, pass }
        })
        return transporter
    }
}

const sendVerifyEmail = async ({ name, email, otp, logger }: EmailVerifyDataT) => {
    const transporter = await getTransporter()
    const mailOptions = {
        from: EMAIL_FROM,
        to: email,
        subject: "Verify your email address",
        // text: `Hello ${name}, please verify your email address by using the OTP ${otp}`,
        html: await createOtpEmailHtml(otp, name)
    }
    const info = await transporter.sendMail(mailOptions)
    const previewUrl = getTestMessageUrl(info)
    console.info("emailQueue.sendVerifyEmail:: message sent: %s", info.messageId)
    console.info("emailQueue.sendVerifyEmail:: preview URL: %s", previewUrl);
}

const EMAIL_QUEUE_NAME = "email" as const

export const emailQueue = new Queue<EmailVerifyDataT, unknown, EmailJobT>(EMAIL_QUEUE_NAME)

const worker = new Worker<EmailVerifyDataT, unknown, EmailJobT>(EMAIL_QUEUE_NAME, async (job) => {
    console.info("emailQueue.worker:: job started")
    if (job.name === "email-verify") {
        console.info("emailQueue.worker:: sending email verification")
        await sendVerifyEmail(job.data)
    }
}, { connection: { url: VALKEY_URL } })

worker.on("completed", (job) => {
    console.info("emailQueue.worker:: job completed")
})

worker.on("failed", (job, error) => {
    console.error(error, "emailQueue.worker:: job failed")
})
