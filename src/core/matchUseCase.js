// src/core/matchUseCase.js
// Core match use-case: load pets and register likes/matches via adapters.

import Pet from '../models/Pet.js';

export async function loadPets(petsAdapter) {
  if (!petsAdapter || typeof petsAdapter.searchPetRecords !== 'function') {
    throw new Error('Adapter inválido: se necesita searchPetRecords');
  }
  const results = await petsAdapter.searchPetRecords();
  return results.map((r) => (r instanceof Pet ? r : new Pet(r)));
}

export async function likePet(user, pet, userAdapter) {
  if (!user) throw new Error('User not authenticated');
  if (!userAdapter || typeof userAdapter.addMatchedPetToUser !== 'function') {
    throw new Error('Adapter inválido: se necesita addMatchedPetToUser');
  }

  await userAdapter.addMatchedPetToUser(user.uid, pet.id);
  // Business rule check can be executed by caller (presenter) if needed
  return true;
}

export default { loadPets, likePet };
