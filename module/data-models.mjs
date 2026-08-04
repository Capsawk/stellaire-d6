import { PersonnageModel } from './data/actor/personnage.mjs';
import {
  ArmeModel,
  ArmureModel,
  OutilModel,
  ReliqueModel,
  EquipementModel,
  CapaciteModel,
  PouvoirModel,
  MarqueModel,
  OrigineModel
} from './data/item/item.mjs';

export const personnageConfig = {
  personnage: PersonnageModel
};

export const itemConfig = {
  arme: ArmeModel,
  armure: ArmureModel,
  outil: OutilModel,
  relique: ReliqueModel,
  equipement: EquipementModel,
  capacite: CapaciteModel,
  pouvoir: PouvoirModel,
  marque: MarqueModel,
  origine: OrigineModel
};
