import { Router } from "express";
import { listPublicTeam } from "../controllers/team.controller.js";

const router = Router();

router.get("/", listPublicTeam);

export default router;
