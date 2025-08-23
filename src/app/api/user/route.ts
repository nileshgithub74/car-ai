
import { prisma } from "@/lib/db";


import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(req: Request){
  try{

    const body = await  req.json();
    const {email, userName, password} = body;



    // check if email already exits
    
    const existingUserByEmail = await prisma.user.findUnique({
        where:{email:email}

    });

    if(existingUserByEmail){
        return NextResponse.json({
            user:null,
            message:"User with this email exit",
            
        },{status: 409});
    }
    








    return NextResponse.json( { 
        data:body,
        message:"created successfully",
        status:201});





  }catch(err){
    console.log(err);

  }
}