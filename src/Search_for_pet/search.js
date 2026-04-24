import coreSearch from '../core/searchUseCase.js';

/**
 * Legacy small search helper kept for compatibility with existing tests.
 * Delegates to core.findPetByAttributes which has the original intent-revealing name.
 */
export default function buscarMascota(params) {
  return coreSearch.findPetByAttributes(params);
}