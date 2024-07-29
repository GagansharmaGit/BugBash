import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function POST(request:NextRequest){
    try {
        //Grab  the data
        const {voteById, types, voteStatus, typeId} = await request.json();

        //List document
        const response = await databases.listDocuments(db,voteCollection,[
            Query.equal("types",types),
            Query.equal("typeId",typeId),
            Query.equal("voteById",voteById),
        ])

        if(response.documents.length > 0){
            await databases.deleteDocument(db,voteCollection,response.documents[0].$id);

            //decrease the reputation
            const QuestionOrAnswer = await databases.getDocument(
                db, 
                types == "question" ? questionCollection:answerCollection,
                typeId
            );
           const authorPrefs = await users.getPrefs(QuestionOrAnswer.authorId)

           await users.updatePrefs(QuestionOrAnswer.authorId,{
            reputation : response.documents[0].voteStatus == 
            "upvoted" ? Number(authorPrefs.reputation) - 1 :
             Number(authorPrefs.reputation) + 1
           })
        }

        //this means that the previous vote does not exist or vote status changed
        if(response.documents[0]?.voteStatus !== voteStatus){
            //
        }

        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db,voteCollection,[
               Query.equal("types",types), 
               Query.equal("typeId",typeId), 
               Query.equal("voteStatus","upvoted"), 
               Query.equal("voteById",voteById), 
               Query.limit(1),
            ]),
            databases.listDocuments(db,voteCollection,[
                Query.equal("types",types), 
                Query.equal("typeId",typeId), 
                Query.equal("voteStatus","downvoted"), 
                Query.equal("voteById",voteById), 
                Query.limit(1),
             ]),
        ])
        
        return NextResponse.json(
            {
                data:{
                    data:null,
                    voteResult:upvotes.total = downvotes.total
                },
                message: "Vote Handled"
            },
            {status:200}
        )

    } catch (error:any) {
        return NextResponse.json({
            message:error?.message || "Error while voting"
         },
     {
         status:error?.status || error?.code || 500
     })
    }
}