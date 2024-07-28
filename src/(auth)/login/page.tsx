"use client"
import { useAuthStore } from '@/store/Auth'
import React from 'react'

const LoginPage = () => {
    const {login} = useAuthStore();
    const [isloading,isSetLoading] = React.useState(false);
    const [error,isSetError] = React.useState("");
    const handleSubmit = async (e:any)=>{
        e.preventDefault();

        //collect data
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        //handling Loading and errors
        isSetLoading(true);
        isSetError("");

        //validation
        if(!email || !password){
            isSetError("Please fill out all fields");
            return
        }

        //login=>store

        const loginResponse = await login(email.toString(), password.toString());
        if(loginResponse.error){
            isSetError(()=>loginResponse.error!.message)
        }

        isSetLoading(false);

    }
  return (
    <div>Loginpage</div>
  )
}

export default LoginPage