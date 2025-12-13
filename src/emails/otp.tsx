import { OTP_TTL } from "@/config";
import { Section, Tailwind, Text } from "@react-email/components";
import * as React from "react";
import { render } from "@react-email/render";

type Props = {
  otp: string;
  name?: string;
};
export default function OtpEmail({ otp, name }: Props) {
  return (
    <Tailwind>
      <Section className="flex justify-center items-center w-full min-h-screen font-sans">
        <Section className="flex flex-col items-center w-76 rounded-2xl px-6 py-1 bg-gray-50">
          <Text className="text-xs font-medium text-violet-500">
            One Time Password (OTP)
          </Text>
          <Text className="text-gray-500 my-0">
            Use the following code to authenticate
          </Text>
          <Text className="text-5xl font-bold pt-2">{otp}</Text>
          <Text className="text-gray-400 font-light text-xs pb-4">
            This code is valid for {OTP_TTL / 60} minutes
          </Text>
          <Text className="text-gray-600 text-xs">
            Thank you for joining us {name ?? ""}
          </Text>
        </Section>
      </Section>
    </Tailwind>
  );
}

export function createOtpEmailHtml(otp: string, name?: string) {
  return render(<OtpEmail otp={otp} name={name} />);
}
