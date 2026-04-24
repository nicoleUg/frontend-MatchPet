// src/core/registerUseCase.js
// Core use-case: validate form data and register a pet through an injected adapter.

import Pet from '../models/Pet.js';

/**
 * Validate input fields and return a Pet instance or a validation error string.
 * This function has a clear name expressing its intent.
 */
export function buildValidatedPetEntity({ name, species, gender, age, breed, personality }) {
  const trimmedName = name?.trim();

  if (!trimmedName || !species || !gender) {
    return 'Por favor, rellena los campos obligatorios (*): Nombre, Especie y Sexo.';
  }

  const petData = {
    name: trimmedName,
    species,
    gender,
    age,
    breed,
    personality
  };

  return Pet.fromPlain(petData);
}

/**
 * Register a pet: validate the data, assign an owner id and persist using the adapter.
 * The petsAdapter provides the port to the persistence layer; this keeps core decoupled.
 */
export async function registerPet(formValues, currentUser, petsAdapter) {
  const petOrError = buildValidatedPetEntity(formValues);
  if (typeof petOrError === 'string') return petOrError;

  const ownerId = currentUser ? currentUser.uid : 'guest';

  if (!petsAdapter || typeof petsAdapter.createPetRecord !== 'function') {
    throw new Error('Adapter inválido: se necesita createPetRecord');
  }

  const saved = await petsAdapter.createPetRecord(petOrError, ownerId);
  return saved;
}

export default { buildValidatedPetEntity, registerPet };
