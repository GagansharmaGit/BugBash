import { Permission } from "appwrite";
import { commentCollection, db } from "../name";
import { databases } from "./config";

export default async function createCommentCollection(){
    //Creating Collections
    await databases.createCollection(db,commentCollection,commentCollection,
        [
            Permission.create("users"),
            Permission.read("any"),
            Permission.read("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ]
    );

    console.log("commentCollection is created");

    //Creating Attributes
    await Promise.all(
        [
            databases.createStringAttribute(
                db,
                commentCollection,
                "content",
                10000,
                true
            ),
            databases.createEnumAttribute(
                db,
                commentCollection,
                "types",
                ["answer","question"],
                true
            ),
            databases.createStringAttribute(
                db,
                commentCollection,
                "typeId",
                100,
                true
            ),
            databases.createStringAttribute(
                db,
                commentCollection,
                "authorId",
                100,
                true
            )
        ]
    )
    console.log("Comment Attribute Created")
}