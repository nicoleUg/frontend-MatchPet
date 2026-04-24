// src/models/Pet.js
export default class Pet {
  constructor({
    id = null,
    name,
    species,
    gender,
    age = null,
    breed = null,
    personality = '',
    status = 'available',
    ownerId = 'guest',
    photoUrl = null,
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.name = name;
    this.species = species;
    this.gender = gender;
    this.age = age;
    this.breed = breed;
    this.personality = personality;
    this.status = status;
    this.ownerId = ownerId;
    this.photoUrl = photoUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Para guardar en Firestore
  toFirestore() {
    return {
      name: this.name,
      species: this.species,
      gender: this.gender,
      age: this.age,
      breed: this.breed,
      personality: this.personality,
      status: this.status,
      ownerId: this.ownerId,
      photoUrl: this.photoUrl,
      createdAt: this.createdAt, // los setea el service con serverTimestamp()
      updatedAt: this.updatedAt,
    };
  }

  // Construir desde doc de Firestore
  static fromFirestore(doc) {
    const data = typeof doc.data === 'function' ? doc.data() : doc.data;
    const id = doc.id ?? doc?.id ?? null;
    return new Pet({
      id,
      ...data,
    });
  }

  // Construir desde objeto plano (p.ej. tu registrar())
  static fromPlain(obj = {}) {
    return new Pet(obj);
  }
}
