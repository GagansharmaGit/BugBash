import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import {UserPrefs} from "@/store/Auth"
import { answerCollection } from "@/models/name";
import { db } from "@/models/name";
export async function POST(request:NextRequest){
    try {
        const {questionId, answer, autherId} = await request.json();
        const response = await databases.createDocument(db, answerCollection, ID.unique(),{
            content:answer,
            autherId:autherId,
            questionId:questionId
        })

        //Increasing the author Reputation
        const prefs = await users.getPrefs<any>(autherId);
        await users.updatePrefs(autherId,{
            reputation:Number(prefs.reputation) + 1
        });

        return NextResponse.json(response,{
                status:200
            }
        )
    } catch (error:any) {
        return NextResponse.json({
            error:error?.message || "Error while creating answer"
        },
    {
        status:error?.status || error?.code || 500
    })
    }
}

export async function DELETE(request:NextRequest){
    try {
        const {answerId} = await request.json();
        const answer = await databases.getDocument(db,answerCollection,answerId);
        const response = await databases.deleteDocument(db,answerCollection,answerId);

        //Decreasing the reputation
        const prefs = await users.getPrefs<any>(answer.autherId);
        await users.updatePrefs(answer.autherId,{
            reputation:Number(prefs.reputation) - 1
        });
        
        return NextResponse.json({
            data:response
        },
        {
            status:200
        }
    )
    } catch (error:any) {
        return NextResponse.json({
           message:error?.message || "Error while deleting the answer"
        },
    {
        status:error?.status || error?.code || 500
    })
    }
}