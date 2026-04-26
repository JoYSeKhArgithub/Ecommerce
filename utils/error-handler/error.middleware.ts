import logger from "../logger";
import { AppError } from "./index"
import type { Response,Request } from "express";

export const errorMiddleWare = (error: Error,req: Request,res:Response)=>{
    if(error instanceof AppError){
        logger.error(`Error ${req.method} ${req.url}- ${error.message}`);

        return res.status(error.statusCode).json({
            status: "error",
            message: error.message,
            ...(error.details && {details: error.details})
        })
    }
    return res.status(500).json({
        error: "Something went wrong, please try again !"
    })
}