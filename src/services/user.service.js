import { addToUserArray, removeFromUserArray } from './demo-store.js';

export const userService = {
  async addMatchedPet(userId, petId) {
    addToUserArray(userId, 'matches', petId);
  },

  async addAdoptedPet(userId, petId) {
    addToUserArray(userId, 'adoptions', petId);
    removeFromUserArray(userId, 'matches', petId);
  },
};
