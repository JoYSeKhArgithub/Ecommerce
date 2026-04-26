import type { NextFunction, Request,Response } from "express"
// import { InternalServerError } from "../../../../utils/error-handler"
import userService, { sendOtp } from "../service/auth.service"


export const userRegistration = async(req: Request,res: Response, next: NextFunction)=>{
    try {
        const {name} = req.body;
        const email = await userService.emailChcek(req.body);
        await userService.checkOtpRestrictions(email);
        await userService.tarckOtpRequests(email);
        await sendOtp(name,email,"user-activation-mail");
        return res.status(200).json({
            message: "OTP send to email, Please verify account."
        })
    } catch (error) {
        return next(error)
    }
}