// src/adapters/userServiceAdapter.js
// Adapter wrapping user.service for core use-cases

import { userService } from '../services/user.service.js';

export async function addMatchedPetToUser(userId, petId) {
  return userService.addMatchedPet(userId, petId);
}

export async function addAdoptedPetToUser(userId, petId) {
  return userService.addAdoptedPet(userId, petId);
}

export default {
  addMatchedPetToUser,
  addAdoptedPetToUser,
};
