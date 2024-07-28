"use client"
import { useAuthStore } from '@/store/Auth'
import React, { useState } from 'react'

const RegesterPage = () => {
    const {createAccount,login} = useAuthStore();
    const [isloading,isSetLoading] = React.useState(false);
    const [error,isSetError] = React.useState("");
    const handleSubmit = async (e:any)=>{
        e.preventDefault();

        //collect data
        const formData = new FormData(e.currentTarget);
        const firstname = formData.get("firstname");
        const lastname = formData.get("lastname");
        const email = formData.get("email");
        const password = formData.get("password");

        //validate
        if(!firstname || !lastname || !email || !password){
            isSetError("Please fill out all the fields");
            return
        }

        //call the store
        isSetLoading(true);
        isSetError("");

        const response = await createAccount(
            `${firstname} ${lastname}`,
            email?.toString(),
            password?.toString(),
        )

        //respoonse
        if(response.error){
            isSetError(response.error!.message);
        }else{
            
            const loginResponse = await login(email.toString() ,password.toString());
            if(loginResponse.error){
                isSetError(loginResponse.error!.message);
            }
        }
        isSetLoading(false);

    }
  return (
    <div>
        {error &&  (
            <p>{error}</p>
        )}
        <form onSubmit={handleSubmit}></form>
    </div>
  )
}

export default RegesterPage