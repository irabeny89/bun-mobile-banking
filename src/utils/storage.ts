import { STORAGE } from "@/config";
import { CommonSchema } from "@/share/schema";

/** S3 compatible file storage client */
export const fileStore = new Bun.S3Client({
    accessKeyId: STORAGE.accessKeyId,
    secretAccessKey: STORAGE.secretAccessKey,
    region: STORAGE.defaultRegion,
    endpoint: STORAGE.endpointUrl,
    bucket: STORAGE.bucket,
})

export function getUploadLocation(storageBucket: string, file: File, userType: CommonSchema.UserType, userId: string) {
    const ext = file.type.split("/")[1];
    const path = `${storageBucket}/${userType}-${userId}.${ext}`;
    const url = `${STORAGE.endpointUrl}/${path}`;
    return { path, url };
}