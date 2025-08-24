import { hash } from 'bcrypt';

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import  * as  z from 'zod';


// schema for input  validation
const userSchema = z
  .object({
    userName: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(8, 'Password must have at least 8 characters'),
    
  })
   



export async function POST(req: Request){
  try{

    const body = await  req.json();
    const {email, userName, password} = userSchema.parse(body);



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
    

    // check if username already exits

    
    const existingUserByuserName = await prisma.user.findUnique({
        where:{userName: userName}

    });

    if(existingUserByuserName){
        return NextResponse.json({
            user:null,
            message:"User already exit",
            
        },{status: 409});
    }


    //stored the data;

    const hashPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
        data:{
            userName, email,
            password :hashPassword
        }
    })

const { password: newUserPassword, ...rest } = newUser;





    return NextResponse.json( { 
        user:rest,
        message:"created successfully",
       },
       { status:201}
    );





  }catch(err){
    console.log(err);

  }
}