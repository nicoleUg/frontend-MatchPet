import { userService } from '../services/user.service.js';
import { updatePet } from '../services/pets.service.js';

export async function adoptPet(userId, petId) {
  if (!userId || !petId) {
    throw new Error('UserId and PetId are required to adopt.');
  }

  await updatePet(petId, {
    status: 'adopted',
    ownerId: userId,
  });

  await userService.addAdoptedPet(userId, petId);

  return { success: true, message: 'Adoption successful' };
}
