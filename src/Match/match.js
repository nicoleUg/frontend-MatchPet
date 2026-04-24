import coreMatch from '../core/matchUseCase.js';
import userAdapter from '../adapters/userServiceAdapter.js';
import { auth } from '../firebase.js';

export const checkMatch = (petId) => {
  // Keep the trivial business rule here; can be made more complex later
  return true;
};

export const addMatchToUser = async (petId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return coreMatch.likePet(user, { id: petId }, userAdapter);
};
