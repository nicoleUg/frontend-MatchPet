// src/adapters/petsServiceAdapter.js
// Adapter that provides a stable interface (ports) for the core use-cases
// to interact with the data layer (services/pets.service.js).

import * as petsService from '../services/pets.service.js';

export async function createPetRecord(petInstance, ownerId) {
  return petsService.createPet(petInstance, ownerId);
}

export async function findPetById(petId) {
  return petsService.getPet(petId);
}

export async function searchPetRecords(filters) {
  return petsService.searchPets(filters);
}

export async function updatePetRecord(id, partial) {
  return petsService.updatePet(id, partial);
}

export async function deletePetRecord(id) {
  return petsService.deletePet(id);
}

export default {
  createPetRecord,
  findPetById,
  searchPetRecords,
  updatePetRecord,
  deletePetRecord
};
