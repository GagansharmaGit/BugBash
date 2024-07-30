// import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
// import { databases, users } from "@/models/server/config";
// import { NextRequest, NextResponse } from "next/server";
// import { ID, Query } from "node-appwrite";

// export async function POST(request:NextRequest){
//     try {
//         //Grab  the data
//         const {voteById, types, voteStatus, typeId} = await request.json();

//         //List document
//         const response = await databases.listDocuments(db,voteCollection,[
//             Query.equal("types",types),
//             Query.equal("typeId",typeId),
//             Query.equal("voteById",voteById),
//         ])

//         if(response.documents.length > 0){
//             await databases.deleteDocument(db,voteCollection,response.documents[0].$id);

//             //decrease the reputation
//             const QuestionOrAnswer = await databases.getDocument(
//                 db, 
//                 types == "question" ? questionCollection : answerCollection,
//                 typeId
//             );
             
//            const authorPrefs = await users.getPrefs(QuestionOrAnswer.authorId)

//            await users.updatePrefs(QuestionOrAnswer.authorId,{
//             reputation : response.documents[0].voteStatus == 
//             "upvoted" ? Number(authorPrefs.reputation) - 1 :
//              Number(authorPrefs.reputation) + 1
//            })
//         }

//         //this means that the previous vote does not exist or vote status changed
//         const QuestionOrAnswer = await databases.getDocument(
//             db, 
//             types == "question" ? questionCollection:answerCollection,
//             typeId
//         );
        
//         if(response.documents[0]?.voteStatus !== voteStatus){
//             const doc = await databases.createDocument(db,voteCollection,ID.unique(),{
//                 types, typeId,voteStatus,voteById
//             })

//             //handling the reputation(Increase or decrease the reputation)
//             const authorPrefs = await users.getPrefs(QuestionOrAnswer.authorId)

//            //If vote was present
//            if(response.documents[0]){
//             await users.updatePrefs(
//                 QuestionOrAnswer.authorId,{
//                     //that means prev vote was"upvoted" and 
//                     //new value is "downvoted" so we have to decrease the reputation

//                     reputation:
//                     response.documents[0].voteStatus == "upvoted"
//                     ? Number(authorPrefs.reputation) -1
//                     : Number(authorPrefs.reputation) + 1,
//                 }
//             ); 
//            }
//         }

//         const [upvotes, downvotes] = await Promise.all([
//             databases.listDocuments(db,voteCollection,[
//                Query.equal("types",types), 
//                Query.equal("typeId",typeId), 
//                Query.equal("voteStatus","upvoted"), 
//                Query.equal("voteById",voteById), 
//                Query.limit(1),
//             ]),
//             databases.listDocuments(db,voteCollection,[
//                 Query.equal("types",types), 
//                 Query.equal("typeId",typeId), 
//                 Query.equal("voteStatus","downvoted"), 
//                 Query.equal("voteById",voteById), 
//                 Query.limit(1),
//              ]),
//         ])
        
//         return NextResponse.json(
//             {
//                 data:{
//                     data:null,
//                     voteResult:upvotes.total = downvotes.total
//                 },
//                 message: "Vote Handled"
//             },
//             {status:200}
//         )

//     } catch (error:any) {
//         return NextResponse.json({
//             message:error?.message || "Error while voting"
//          },
//      {
//          status:error?.status || error?.code || 500
//      })
//     }
// }



import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const { voteById, voteStatus, types, typeId } = await request.json();

        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("types", types),
            Query.equal("typeId", typeId),
            Query.equal("voteById", voteById),
        ]);

        if (response.documents.length > 0) {
            await databases.deleteDocument(db, voteCollection, response.documents[0].$id);

            // Decrease the reputation of the question/answer author
            const questionOrAnswer = await databases.getDocument(
                db,
                types === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);

            await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                reputation:
                    response.documents[0].voteStatus === "upvoted"
                        ? Number(authorPrefs.reputation) - 1
                        : Number(authorPrefs.reputation) + 1,
            });
        }

        // that means prev vote does not exists or voteStatus changed
        if (response.documents[0]?.voteStatus !== voteStatus) {
            const doc = await databases.createDocument(db, voteCollection, ID.unique(), {
                types,
                typeId,
                voteStatus,
                voteById,
            });

            // Increate/Decrease the reputation of the question/answer author accordingly
            const questionOrAnswer = await databases.getDocument(
                db,
                types === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(questionOrAnswer.authorId);

            // if vote was present
            if (response.documents[0]) {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
                        response.documents[0].voteStatus === "upvoted"
                            ? Number(authorPrefs.reputation) - 1
                            : Number(authorPrefs.reputation) + 1,
                });
            } else {
                await users.updatePrefs<UserPrefs>(questionOrAnswer.authorId, {
                    reputation:
                        // that means prev vote was "upvoted" and new value is "downvoted" so we have to decrease the reputation
                        voteStatus === "upvoted"
                            ? Number(authorPrefs.reputation) + 1
                            : Number(authorPrefs.reputation) - 1,
                });
            }

            const [upvotes, downvotes] = await Promise.all([
                databases.listDocuments(db, voteCollection, [
                    Query.equal("types", types),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "upvoted"),
                    Query.equal("voteById", voteById),
                    Query.limit(1), // for optimization as we only need total
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal("types", types),
                    Query.equal("typeId", typeId),
                    Query.equal("voteStatus", "downvoted"),
                    Query.equal("voteById", voteById),
                    Query.limit(1), // for optimization as we only need total
                ]),
            ]);

            return NextResponse.json(
                {
                    data: { document: doc, voteResult: upvotes.total - downvotes.total },
                    message: response.documents[0] ? "Vote Status Updated" : "Voted",
                },
                {
                    status: 201,
                }
            );
        }

        const [upvotes, downvotes] = await Promise.all([
            databases.listDocuments(db, voteCollection, [
                Query.equal("types", types),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
                Query.equal("voteById", voteById),
                Query.limit(1), // for optimization as we only need total
            ]),
            databases.listDocuments(db, voteCollection, [
                Query.equal("types", types),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
                Query.equal("voteById", voteById),
                Query.limit(1), // for optimization as we only need total
            ]),
        ]);
 
        return NextResponse.json(
            {
                data: { 
                    document: null, voteResult: upvotes.total - downvotes.total 
                },
                message: "Vote Withdrawn",
            },
            {
                status: 200,
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Error deleting answer" },
            { status: error?.status || error?.code || 500 }
        );
    }
}