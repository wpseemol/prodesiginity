import { Router } from "express";
import { getPublicServicesCatalog } from "../controllers/services.controller";

const router = Router();

router.get("/", getPublicServicesCatalog);

export default router;
