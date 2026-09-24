import { Router } from "express";
import { listPublicTeam } from "../controllers/team.controller";

const router = Router();

router.get("/", listPublicTeam);

export default router;
