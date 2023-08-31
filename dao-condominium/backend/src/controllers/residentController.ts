import { Request, Response } from "express";
import Resident from "src/models/resident";
import residentRepository from "src/repositories/residentRepository";

async function getResident(req: Request, res: Response) {
  const wallet = req.params.wallet;

  const resident = await residentRepository.getResident(wallet);

  if (!resident) {
    return res.status(404).send("Resident not found");
  }
  return res.status(200).json(resident);
}

async function postResident(req: Request, res: Response) {
  const resident = req.body as Resident;
  const result = await residentRepository.addResident(resident);

  return res.status(201).json(result);
}

async function patchResident(req: Request, res: Response) {
  const wallet = req.params.wallet;
  const resident = req.body as Resident;
  const result = await residentRepository.updateResident(wallet, resident);

  return res.json(result);
}

async function deleteResident(req: Request, res: Response) {
  const wallet = req.params.wallet;
  const success = await residentRepository.deleteResident(wallet);

  if (success) {
    return res.sendStatus(204);
  }

  return res.sendStatus(404);
}

export default {
  getResident,
  postResident,
  patchResident,
  deleteResident,
};
