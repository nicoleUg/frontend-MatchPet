// src/Register_Pet/register.js

import coreRegister from '../core/registerUseCase.js';

// Backwards-compatible wrapper with a clear internal implementation in core
export function validateAndCreatePet(name, species, gender, age, breed, personality) {
    return coreRegister.buildValidatedPetEntity({
        name,
        species,
        gender,
        age,
        breed,
        personality
    });
}

export default validateAndCreatePet;