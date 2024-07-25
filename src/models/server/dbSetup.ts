import { db } from "../name";
import createQuestionCollections from "./question.collection";
import createCommentCollection from "./comment.collection";
import createStorageCollection from "./storage.collection";
import createAnswerCollection from "./answer.collection";
import createVoteCollection from "./vote.collection"
import { databases } from "./config";

export default async function getOrCreateDb(){
    try {
        await databases.get(db);
        console.log("Database Connected")
    } catch (error) {
        try {
            await databases.create(db,db);
            console.log("database Created");

            //Creating Collections
            await Promise.all([
                createQuestionCollections(),
                createCommentCollection(),
                createAnswerCollection(),
                createVoteCollection()
            ])

            console.log("Collection Created")
            console.log("Database Connected")
        } catch (error) {
            console.log("Error while creating the database in the dbSetup.ts file: ",error)
        }
    }

    return databases;
}