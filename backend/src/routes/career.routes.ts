import { Router } from "express";
import { sendCareerEmail } from "../controllers/career.controller";
import upload from "../middlewares/upload";

const router = Router();

router.post("/send-mail", upload.single("resume"), sendCareerEmail);

export default router;
