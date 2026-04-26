import type { NextFunction,Request,Response } from "express";
import { USERTYPE } from "../utils";
import { ValidationError } from "../../../../utils/error-handler";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validationMiddleWare = async(req:Request,res:Response,next: NextFunction)=>{
    const {name,email,password,phoneNumber,country,userType} = req.body;
    if(!name|| !email||!password || (userType === USERTYPE.SELLER && (!phoneNumber || !country))){
        throw new ValidationError(`Missing required fileds!`)
    }

    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid email formate! ")
    }
    next()
}