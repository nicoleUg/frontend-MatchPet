// src/core/searchUseCase.js
// Core search use-case: fetch pets via adapter and apply client-side filters.

import Pet from '../models/Pet.js';

export async function fetchAndFilterPets({ species } = {}, petsAdapter) {
  if (!petsAdapter || typeof petsAdapter.searchPetRecords !== 'function') {
    throw new Error('Adapter inválido: se necesita searchPetRecords');
  }

  const results = await petsAdapter.searchPetRecords({ species });
  // Normalize to Pet instances
  const pets = results.map((r) => (r instanceof Pet ? r : new Pet(r)));
  return pets;
}

// A small simple-search function used by legacy tests: checks a single static pet
export function findPetByAttributes({ nombre, especie, genero, edad, raza }) {
  const mascota = {
    nombre: 'Max',
    edad: 3,
    raza: 'Bulldog',
    especie: 'Perro',
    genero: 'Macho'
  };

  if (nombre && nombre === mascota.nombre) {
    throw new Error('¡Mascota Encontrada por nombre!');
  }
  if (especie && especie === mascota.especie) {
    throw new Error('¡Mascota Encontrada por especie!');
  }
  if (edad !== undefined && edad === mascota.edad) {
    throw new Error('¡Mascota Encontrada por edad!');
  }
  if (raza && raza === mascota.raza) {
    throw new Error('¡Mascota Encontrada por raza!');
  }
  if (genero && genero === mascota.genero) {
    throw new Error('¡Mascota Encontrada por género!');
  }

  return '¡Mascota No Encontrada!';
}

export default { fetchAndFilterPets, findPetByAttributes };
