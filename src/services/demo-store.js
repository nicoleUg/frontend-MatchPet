// src/services/demo-store.js
// In-memory/localStorage persistence used for the demo frontend.
// This replaces Firebase/Firestore for a self-contained client-only app.

const STATE_KEY = 'matchpet_demo_state_v1';

const nowIso = () => new Date().toISOString();

const safeJsonParse = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const readState = () => {
  if (typeof localStorage === 'undefined') {
    return { pets: [], users: [] };
  }

  const raw = localStorage.getItem(STATE_KEY);
  const parsed = safeJsonParse(raw, null);

  if (!parsed || typeof parsed !== 'object') {
    return { pets: [], users: [] };
  }

  return {
    pets: Array.isArray(parsed.pets) ? parsed.pets : [],
    users: Array.isArray(parsed.users) ? parsed.users : [],
  };
};

const writeState = (state) => {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
};

const makeId = (prefix) => `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;

export function ensureSeedData() {
  const state = readState();
  if (state.pets.length > 0) {
    return;
  }

  const seedPets = [
    {
      id: makeId('pet'),
      name: 'Max',
      species: 'perro',
      gender: 'macho',
      age: 2,
      breed: 'Labrador',
      personality: 'Juguetón y cariñoso',
      status: 'available',
      ownerId: 'guest',
      photoUrl: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId('pet'),
      name: 'Luna',
      species: 'gato',
      gender: 'hembra',
      age: 1,
      breed: 'Mestizo',
      personality: 'Tranquila y curiosa',
      status: 'available',
      ownerId: 'guest',
      photoUrl: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: makeId('pet'),
      name: 'Rocky',
      species: 'perro',
      gender: 'macho',
      age: 5,
      breed: 'Bulldog',
      personality: 'Leal y protector',
      status: 'available',
      ownerId: 'guest',
      photoUrl: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  writeState({ ...state, pets: seedPets });
}

export function listPets(filters = {}) {
  ensureSeedData();
  const state = readState();

  const { species, status, ownerId } = filters;

  const filtered = state.pets.filter((p) => {
    if (species && p.species !== species) return false;
    if (status && p.status !== status) return false;
    if (ownerId && p.ownerId !== ownerId) return false;
    return true;
  });

  // Order by createdAt desc (ISO string compares lexicographically)
  filtered.sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));

  return filtered;
}

export function getPetById(id) {
  if (!id) return null;
  ensureSeedData();
  const state = readState();
  return state.pets.find((p) => p.id === id) ?? null;
}

export function createPetRecord(petPlain) {
  ensureSeedData();
  const state = readState();
  const record = {
    ...petPlain,
    id: petPlain.id ?? makeId('pet'),
    createdAt: petPlain.createdAt ?? nowIso(),
    updatedAt: petPlain.updatedAt ?? nowIso(),
  };

  writeState({ ...state, pets: [record, ...state.pets] });
  return record;
}

export function updatePetRecord(id, partial) {
  const state = readState();
  const idx = state.pets.findIndex((p) => p.id === id);
  if (idx === -1) return;

  const next = {
    ...state.pets[idx],
    ...partial,
    updatedAt: nowIso(),
  };

  const pets = state.pets.slice();
  pets[idx] = next;
  writeState({ ...state, pets });
}

export function deletePetRecord(id) {
  const state = readState();
  writeState({ ...state, pets: state.pets.filter((p) => p.id !== id) });
}

export function findUserByEmail(email) {
  if (!email) return null;
  const state = readState();
  return state.users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase()) ?? null;
}

export function getUserById(uid) {
  if (!uid) return null;
  const state = readState();
  return state.users.find((u) => u.uid === uid) ?? null;
}

export function createUser({ fullName, email, password }) {
  const state = readState();
  const existing = findUserByEmail(email);
  if (existing) {
    const err = new Error('Este correo electrónico ya está registrado');
    err.code = 'demo/email-already-in-use';
    throw err;
  }

  const user = {
    uid: makeId('user'),
    fullName: fullName?.trim() ?? '',
    displayName: fullName?.trim() ?? '',
    email: email?.trim().toLowerCase() ?? '',
    password: String(password ?? ''),
    matches: [],
    adoptions: [],
    phone: '',
    location: '',
    bio: '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  writeState({ ...state, users: [user, ...state.users] });
  return user;
}

export function verifyLogin({ email, password }) {
  const user = findUserByEmail(email);
  if (!user) {
    const err = new Error('No existe una cuenta con este correo electrónico');
    err.code = 'demo/user-not-found';
    throw err;
  }

  if (String(user.password) !== String(password)) {
    const err = new Error('Contraseña incorrecta');
    err.code = 'demo/wrong-password';
    throw err;
  }

  return user;
}

export function updateUserRecord(uid, partial) {
  const state = readState();
  const idx = state.users.findIndex((u) => u.uid === uid);
  if (idx === -1) return;

  const next = {
    ...state.users[idx],
    ...partial,
    updatedAt: nowIso(),
  };

  const users = state.users.slice();
  users[idx] = next;
  writeState({ ...state, users });
}

export function addToUserArray(uid, field, value) {
  const user = getUserById(uid);
  if (!user) return;
  const arr = Array.isArray(user[field]) ? user[field] : [];
  if (arr.includes(value)) return;
  updateUserRecord(uid, { [field]: [...arr, value] });
}

export function removeFromUserArray(uid, field, value) {
  const user = getUserById(uid);
  if (!user) return;
  const arr = Array.isArray(user[field]) ? user[field] : [];
  updateUserRecord(uid, { [field]: arr.filter((x) => x !== value) });
}
