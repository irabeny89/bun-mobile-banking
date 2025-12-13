import { EMAIL_FROM, IS_PROD_ENV, VALKEY_URL } from "@/config";
import { createOtpEmailHtml } from "@/emails/otp";
import { Queue, Worker } from "bullmq";
import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer";

type EmailJobT = "email-verify" | "mfa-otp";
type SendOtpEmailDataT = { name?: string } & Record<"subject" | "email" | "otp", string>
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

const sendOtpEmail = async ({ name, email, otp, subject }: SendOtpEmailDataT) => {
    const transporter = await getTransporter()
    const mailOptions = {
        from: EMAIL_FROM,
        to: email,
        subject,
        // text: `Hello ${name}, please verify your email address by using the OTP ${otp}`,
        html: await createOtpEmailHtml(otp, name)
    }
    const info = await transporter.sendMail(mailOptions)
    const previewUrl = getTestMessageUrl(info)
    console.info("emailQueue.sendVerifyEmail:: message sent: %s", info.messageId)
    console.info("emailQueue.sendVerifyEmail:: preview URL: %s", previewUrl);
}

const EMAIL_QUEUE_NAME = "email" as const

export const emailQueue = new Queue<SendOtpEmailDataT, unknown, EmailJobT>(EMAIL_QUEUE_NAME)

const worker = new Worker<SendOtpEmailDataT, unknown, EmailJobT>(EMAIL_QUEUE_NAME, async (job) => {
    console.info("emailQueue.worker:: job started")
    if (job.name === "email-verify") {
        console.info("emailQueue.worker:: sending email verification")
        await sendOtpEmail(job.data)
    }
    if (job.name === "mfa-otp") {
        console.log("emailQueue.worker:: sending mfa otp email")
        await sendOtpEmail(job.data)
    }
}, { connection: { url: VALKEY_URL } })

worker.on("completed", () => {
    console.info("emailQueue.worker:: job completed")
})

worker.on("failed", (_, error) => {
    console.error(error, "emailQueue.worker:: job failed")
})
