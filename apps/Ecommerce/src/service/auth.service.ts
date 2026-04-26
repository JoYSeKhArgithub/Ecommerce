import { AppError, ValidationError } from "../../../../utils/error-handler";
import { STATUS_CODES } from "../../../../utils/ErrorCode";
import User from "../models/user.model";
import crypto from 'crypto'
import { RedisKey } from "../../../../utils/Redis/keys";
import { RedisService } from "../../../../utils/Redis/config";
import { sendEmail } from "../utils/sendEmail/send.email";

const emailChcek = async(body: any)=>{
    const {email} = body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail){
        throw new AppError("Email already exists",STATUS_CODES.ALLREADY_EXIST)
    }
    return email;
};

const checkOtpRestrictions = async(email: string)=>{
    const redisLockKey = RedisKey.otpLock(email);
    const redisSpamLockKey = RedisKey.otpSpamLock(email);
    const coolDownKey = RedisKey.otpCoolDown(email);
    if (await RedisService.get(redisLockKey)){
        throw new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minutes")
    }
    if(await RedisService.get(redisSpamLockKey)){
        throw new ValidationError("Too many OTP requests! Please wait 1 hour before requesting again")
    }
    if (await RedisService.get(coolDownKey)){
        throw new ValidationError("Please wait 1 minute before requesting a new OTP!")
    }
}

export const sendOtp = async(name: string,email: string,template: string)=>{
    const otp = crypto.randomInt(1000,9999).toString();
    const emailSent = await sendEmail(email,"Verify your Email",template,{name,otp});
    if (!emailSent) {
        throw new AppError("Failed to send verification email. Please try again later.", 500);
    }
    const otpKey = RedisKey.otp(email);
    const coolDownKey = RedisKey.otpCoolDown(email);
    await RedisService.set(otpKey,otp,300);
    await RedisService.set(coolDownKey,"true",60);

}

export const tarckOtpRequests = async(email:string)=>{
    const otpRequestCountKey = RedisKey.otpRequestCount(email);
    const redisSpamLockKey = RedisKey.otpSpamLock(email);
    const otpRequest = parseInt((await RedisService.get(otpRequestCountKey)) || "0");
    if(otpRequest >=2){
        await RedisService.set(redisSpamLockKey,"locked",3600)
        throw new ValidationError("Too many OTP requests! Please wait 1 hour before requesting again")
    }

    await RedisService.set(otpRequestCountKey,otpRequest+1,3600)
}

export default { emailChcek, checkOtpRestrictions, tarckOtpRequests }