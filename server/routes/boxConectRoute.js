import express from "express";
import {
  getMassege,

  createMassege

} from "../controllers/boxConectController.js";

const router = express.Router();

router.get("/", getMassege);

router.post("/", createMassege);


export default router;