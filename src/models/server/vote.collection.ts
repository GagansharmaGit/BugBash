import { Permission } from "appwrite";
import { db, voteCollection } from "../name";
import { databases } from "./config";

export default async function createVoteCollection(){
    //Creating Collection
    await databases.createCollection(db,voteCollection,voteCollection,
        [
            Permission.create("users"),
            Permission.read("any"),
            Permission.read("users"),
            Permission.update("users"),
            Permission.delete("users"),
        ]
    );
    console.log("Vote Collection Created");

    //Creating Attributes
    await Promise.all([
        databases.createEnumAttribute(db,
            voteCollection,
            "types",
            ["question","answer"],
            true
        ),
        databases.createStringAttribute(
            db,
            voteCollection,
            "typeId",
            100,
            true
        ),
        databases.createEnumAttribute(
            db,
            voteCollection,
            "voteStatus",
            ["upVote","downVote"],
            true
        ),
        databases.createStringAttribute(
            db,
            voteCollection,
            "voteById",
            100,
            true
        )
    ]);
    console.log("Vote Attribute Created");
}