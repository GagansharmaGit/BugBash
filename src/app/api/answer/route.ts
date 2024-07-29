import { databases, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import {UserPrefs} from "@/store/Auth"
export async function POST(request:NextRequest){
    try {
        const {questionId, answer, autherId} = await request.json();
        const response = await databases.createDocument(db, answer, ID.unique(),{
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
                status:201
            }
        )
    } catch (error:any) {
        return NextResponse.json({
            error:error?.message || "Error while creating answer"
        },
    {
        status:error?.status || error?.code || "500"
    })
    }
}