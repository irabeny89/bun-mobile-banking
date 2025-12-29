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
/**
 * Get the upload location for a file
 * @param storageBucketPath - The path to the storage bucket
 * @param userType - The type of user
 * @param userId - The ID of the user
 * @param ext - The extension of the file
 * @returns The path and URL of the file
 */
export function getUploadLocation(storageBucketPath: string, userType: CommonSchema.UserType, userId: string, ext: string) {
    const path = `${storageBucketPath}/${userType}-${userId}.${ext}`;
    const url = `${STORAGE.endpointUrl}/${path}`;
    return { path, url };
}
