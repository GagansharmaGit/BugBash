import {IndexType, Permission} from "node-appwrite"

import {db, questionCollection} from "../name";
import { databases } from "./config";




export default async function createQuestionCollections(){

    // Creating collections
    await databases.createCollection(db,questionCollection,questionCollection,
        [
            Permission.read("any"),
            Permission.read("users"),
            Permission.update("users"),
            Permission.delete("users"),
            Permission.create("users"),
        ]
    )

    console.log("questionCollection is created");


    //Creating Attributes 
    await Promise.all([
        databases.createStringAttribute(db,questionCollection,"title",100,true),
        databases.createStringAttribute(db,questionCollection,"content",10000,true),
        databases.createStringAttribute(db,questionCollection,"authorID",100,true),
        databases.createStringAttribute(db,questionCollection,"title",100,true),
        databases.createStringAttribute(db,questionCollection,"tags",100,true,undefined,true),
        databases.createStringAttribute(db,questionCollection,"attachmentId",100,false),
    ]);

    console.log("Question Attributes created");

    //Creating Indexes
    await Promise.all([
        databases.createIndex(
            db,
            questionCollection,
            "title",
            IndexType.Fulltext,
            ["title"],
            ["asc"]
        ),
        databases.createIndex(
            db,
            questionCollection,
            "content",
            IndexType.Fulltext,
            ["content"],
            ["asc"]
        ),
    ])

}