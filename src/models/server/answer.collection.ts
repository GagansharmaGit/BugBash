import { Permission } from "appwrite"
import { answerCollection, db } from "../name"
import { databases } from "./config"

export default async function(){

    //Creating Collections
    await databases.createCollection(db,answerCollection,answerCollection,
        [
            Permission.create("users"),
            Permission.read("any"),
            Permission.read("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ]
    )

    console.log("answerCollection is created")

    //Creating Attributes
    Promise.all(
        [
            databases.createStringAttribute(
                db,
                answerCollection,
                "content",
                10000,
                true
            ),
            databases.createStringAttribute(
                db,
                answerCollection,
                "questionId",
                100,
                true
            ),
            databases.createStringAttribute(
                db,
                answerCollection,
                "authorId",
                100,
                true
            )
        ]
    );

    console.log("answer Attributes created")
}