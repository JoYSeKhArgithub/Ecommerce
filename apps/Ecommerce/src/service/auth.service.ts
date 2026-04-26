import { NextFunction } from "express";
import { AppError, ValidationError } from "../../../../utils/error-handler";
import { STATUS_CODES } from "../../../../utils/ErrorCode";
import User from "../models/user.model";
import crypto from 'crypto'
import { RedisKey } from "../../../../utils/Redis/keys";
import { RedisService } from "../../../../utils/Redis/config";
import { sendEmail } from "../utils/sendEmail/send.email";

const emailChcek = async(body: any)=>{
    try {
        const {email} = body;
        const existingEmail = await User.findOne(email);
        if (existingEmail){
            throw new AppError("Email already exists",STATUS_CODES.ALLREADY_EXIST)
        }
        return email;
    } catch (error) {
        throw new Error('Error on checking Email')
    }
};

const checkOtpRestrictions = async(email: string,next: NextFunction)=>{
    const redisLockKey = RedisKey.otpLock(email);
    const redisSpamLockKey = RedisKey.otpSpamLock(email);
    const coolDownKey = RedisKey.otpCoolDown(email);
    if (await RedisService.get(redisLockKey)){
        return next(new ValidationError("Accoungt locked due to multiple failed attempts! Try again after 30 mintues"))
    }
    if(await RedisService.get(redisSpamLockKey)){
        return next(new ValidationError("Too many otp requests! Please wait 1hour before requesting again"))
    }
    if (await RedisService.get(coolDownKey)){
        return next(new ValidationError("Please wait 1 minute before requesting a new OTP!"))
    }
}

export const sendOtp = async(name: string,email: string,template: string)=>{
    const otp = crypto.randomInt(1000,9999).toString();
    await sendEmail(email,"Verify your Email",template,{name,otp});
    const otpKey = RedisKey.otp(email);
    const coolDownKey = RedisKey.otpCoolDown(email);
    await RedisService.set(otpKey,otp,300);
    await RedisService.set(coolDownKey,"true",60);

}

export const tarckOtpRequests = async(email:string,next:NextFunction)=>{
    const otpRequestCountKey = RedisKey.otpRequestCount(email);
    const redisSpamLockKey = RedisKey.otpSpamLock(email);
    const otpRequest = parseInt((await RedisService.get(otpRequestCountKey)) || "0");
    if(otpRequest >=2){
        await RedisService.set(redisSpamLockKey,"locked",3600)
        return next(new ValidationError("Too many otp requests! Please wait 1hour before requesting again"))
    }

    await RedisService.set(otpRequestCountKey,otpRequest+1,3600)
}

export default { emailChcek, checkOtpRestrictions, tarckOtpRequests }