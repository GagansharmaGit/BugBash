import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException,ID,Models } from "appwrite";
import { account } from "@/models/client/config";
import { Mode } from "fs";
import { Suspense } from "react";

export interface UserPrefs {
    reputation :number
}

interface IAuthStore{
    session: Models.Session | null;
    jwt: string | null;
    user: Models.User<UserPrefs> | null;
    hydrated: boolean;

    setHydrated(): void;
    verifySession(): Promise<void>;
    login(
        email:string,
        password:string,

    ): Promise<{
        success:boolean;
        error?:AppwriteException | null
    }>

    createAccount(
        name:string, 
        email:string,
        password:string,

    ): Promise<{
        success:boolean;
        error?:AppwriteException | null
    }>

    logout():Promise<void>
}

export const useAuthStore = create<IAuthStore>()(
    persist(
        immer((set)=({
            session:null,
            jwt:null,
            user:null,
            hydrated:false,
            setHydrated(){
                set({hydrated:true});
            },

            async verifySession(){
                try {
                   const session = await account.getSession("current");
                    set({session});
                     
                } catch (error) {
                    console.log("Error int the auth.ts",error)
                }
            },

            async login(email:string,password:string){
                try {
                    const session = await account.createEmailPasswordSession(email,password);
                    const [user,{jwt}] = await Promise.all([
                        account.get(),
                        account.createJWT()
                    ])

                    if(!user.prefs?.reputation){
                        await account.updatePrefs(
                            reputation:0
                        )
                    }

                    set({session, jwt, user});
                    return {success:true}
                } catch (error) {
                    console.log("error in the auth.ts in login",error)
                    return({
                        success:false,
                        error: error instanceof AppwriteException ?
                        error :null
                    })
                }
            },

            async createAccount(name:string,email:string,password:string){
                try {
                    await account.create(ID.unique(),email,password,name);
                    return{success:true}
                } catch (error) {
                    console.log("Error in the auth.ts createAccount method",error);
                    return({
                        success : false,
                        error: error instanceof AppwriteException ?
                        error :null
                    })
                }
            },

            async logout(){
                try {
                    await account.deleteSessions();
                    set({session:null, jwt:null, user:null})
                } catch (error) {
                    console.log("Error in the auth.ts Logout method",error);
                    // return({
                    //     success : false,
                    //     error: error instanceof AppwriteException ?
                    //     error :null
                    // })
                }
            },
        })),
        {
            name:"auth",
            onRehydrateStorage(){
                return (state,error)=>{
                    if(!error){
                        state?.setHydrated()
                    }
                }
            }
        }
    )
)