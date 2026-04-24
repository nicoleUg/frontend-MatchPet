// src/services/pets.service.js
//
// Responsabilidad: Capa de acceso a datos (DAL) para mascotas.
// En modo demo, persiste en localStorage mediante demo-store.

import Pet from '../models/Pet.js';
import {
	listPets,
	getPetById,
	createPetRecord as createPetInStore,
	updatePetRecord as updatePetInStore,
	deletePetRecord as deletePetInStore,
} from './demo-store.js';

/**
 * Guarda una nueva mascota en la base de datos, asegurando la trazabilidad.
 * Espera una instancia de Pet ya validada y con propiedades de entidad (status, ownerId por defecto).
 * @param {Pet} petInstance - La instancia de Pet (debe ser Pet.fromPlain o Pet.fromFirestore).
 * @param {string} ownerId - El UID del propietario real o 'guest'.
 * @returns {Promise<Pet>} La instancia de Pet con el ID asignado por Firestore.
 */
// 🚨 CAMBIO AQUÍ: Renombrar la función de 'saveNewPet' a 'createPet'
export async function createPet(petInstance, ownerId) {
	const payload = {
		...petInstance.toFirestore(),
		ownerId,
	};

	const record = createPetInStore(payload);
	return Pet.fromPlain(record);
}

/**
 * Obtiene una mascota por su ID.
 * @param {string} id - El ID de la mascota en Firestore.
 * @returns {Promise<Pet | null>} La instancia de Pet o null si no existe.
 */
export async function getPet(id) {
	const record = getPetById(id);
	return record ? Pet.fromPlain(record) : null;
}

/**
 * Busca mascotas aplicando filtros y ordenando por fecha de creación descendente.
 * @param {Object} filters - Objeto con filtros opcionales (species, status, ownerId).
 * @returns {Promise<Pet[]>} Un array de instancias de Pet.
 */
export async function searchPets(filters = {}) {
	const records = listPets(filters);
	return records.map((r) => Pet.fromPlain(r));
}

/**
 * Actualiza parcialmente un documento de mascota.
 * @param {string} id - El ID de la mascota a actualizar.
 * @param {Object} partial - Objeto con los campos a modificar.
 */
export async function updatePet(id, partial) {
	updatePetInStore(id, partial);
}

/**
 * Elimina un documento de mascota por su ID.
 * @param {string} id - El ID de la mascota a eliminar.
 */
export async function deletePet(id) {
	deletePetInStore(id);
}