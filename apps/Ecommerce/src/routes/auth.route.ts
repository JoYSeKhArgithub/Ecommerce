import { Router } from "express";
import { userRegistration } from "../controller/auth.controller";
import { validationMiddleWare } from "../middleware/validation.middleware";

const router = Router();

router.route("/signup").post(validationMiddleWare,userRegistration);

export default router;