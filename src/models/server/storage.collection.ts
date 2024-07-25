import { Permission } from "appwrite";
import { questionAttachmentBucket } from "../name";
import { storage } from "./config";

export default async function createStorageCollection(){
    try {
        await storage.getBucket(questionAttachmentBucket);
        console.log("storage connected")
    } catch (error) {
        try {
            await storage.createBucket(
                questionAttachmentBucket,
                questionAttachmentBucket,
                [
                    Permission.create("users"),
                    Permission.read("any"),
                    Permission.read("users"),
                    Permission.update("users"),
                    Permission.delete("users"),

                ],
                false,
                undefined,
                undefined,
                ["jpg","png","gif","jpeg","webp","heic"]
            );
            console.log("Storage created");
            console.log("Storage Connected");
        } catch (error) {
            console.error("Error in the creating storage in storage.collections.ts file:",error);
        }
    }
}