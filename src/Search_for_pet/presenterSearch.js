// src/Search_for_pet/presenterSearch.js
import '../firebase.js';
import coreSearch from '../core/searchUseCase.js';
import petsAdapter from '../adapters/petsServiceAdapter.js';
import Pet from '../models/Pet.js';


const $ = (id) => document.getElementById(id);

// Normaliza especie/sexo desde UI a los valores que guardas en BD
function normalizeSpecies(v) {
  if (!v || v === 'todos') return undefined;
  return v.toLowerCase(); // "perro" | "gato" | "otro"
}
function normalizeGender(v) {
  if (!v || v === 'todos') return undefined;
  const s = v.toLowerCase();
  if (s === 'm') return 'macho';
  if (s === 'h') return 'hembra';
  return s; // por si ya viene "macho"/"hembra"
}

// Intenta convertir la edad (string) a número (años)
function parseAgeToNumber(age) {
  if (age == null) return NaN;
  // Si guardaste "2", "3", etc. convertirá bien; si guardaste "2 años", extrae primer número
  const m = String(age).match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}

// Aplica filtros por texto y rango de edad en cliente
function applyClientFilters(pets, { name, breed, gender, ageBucket }) {
  const txt = (x) => (x ?? '').toString().toLowerCase();

  return pets.filter((p) => {
    const okName = !name || txt(p.name).includes(name);
    const okBreed = !breed || txt(p.breed).includes(breed);

    const okGender = !gender || (p.gender && p.gender.toLowerCase() === gender);

    let okAge = true;
    if (ageBucket && ageBucket !== 'todos') {
      const n = parseAgeToNumber(p.age);
      if (Number.isFinite(n)) {
        if (ageBucket === '0-1') okAge = n >= 0 && n <= 1;
        else if (ageBucket === '1-5') okAge = n >= 1 && n <= 5;
        else if (ageBucket === '5+') okAge = n > 5;
      }
    }

    return okName && okBreed && okGender && okAge;
  });
}

/* ========= render ========= */

function cardFromTemplate(pet) {
  const tpl = $('pet-card-template');
  const node = tpl.content.firstElementChild.cloneNode(true);

  const imgBox = node.querySelector('.pet-image-container');
  const speciesTag = node.querySelector('.species-tag');
  const h3 = node.querySelector('h3');
  const infoLine = node.querySelector('.pet-info-line');
  const ageEl = node.querySelector('.pet-info-line.age');
  const desc = node.querySelector('.pet-description');

  const photoUrl = pet.photoUrl
    ? pet.photoUrl
    : `https://placehold.co/400x260/A3A3A3/FFFFFF?text=${encodeURIComponent(pet.name || 'Mascota')}`;

  imgBox.style.background = `center / cover no-repeat url('${photoUrl}')`;
  speciesTag.textContent = (pet.species ?? '—').toString().charAt(0).toUpperCase() + (pet.species ?? '—').toString().slice(1);

  h3.textContent = pet.name ?? 'Sin nombre';
  infoLine.textContent = `${pet.breed ?? '—'} • ${pet.gender ?? '—'}`;
  ageEl.textContent = `${pet.age ?? '—'} años`;
  desc.textContent = pet.personality ?? 'Sin descripción';

  return node;
}

function renderResults(pets) {
  const grid = $('resultsGrid');
  const wrap = $('searchResults');
  const counter = $('petCount');

  if (!grid) return;

  if (!pets.length) {
    grid.innerHTML = '';
    counter.textContent = '0 mascotas encontradas';
    wrap.style.display = 'block';
    return;
  }

  grid.innerHTML = '';
  pets.forEach((p) => grid.appendChild(cardFromTemplate(p)));

  counter.textContent = `${pets.length} mascota${pets.length === 1 ? '' : 's'} encontradas`;
  wrap.style.display = 'block';
}

/* ========= main search ========= */

async function runSearch() {
  const name = $('name-input')?.value.trim().toLowerCase() || '';
  const species = normalizeSpecies($('species-select')?.value || '');
  const breed = $('breed-input')?.value.trim().toLowerCase() || '';
  const gender = normalizeGender($('sex-select')?.value || '');
  const ageBucket = $('age-select')?.value || 'todos';


  // 1) Fetch from persistence layer via core use-case + adapter
  let results = await coreSearch.fetchAndFilterPets({ species }, petsAdapter);

  // 2) Filtros en cliente
  const filtered = applyClientFilters(results, { name, breed, gender, ageBucket });

  // 3) Render
  renderResults(filtered);
}

/* ========= init ========= */

function init() {
  // Buscar
  $('search-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    runSearch();
  });

  // Limpiar
  $('clear-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    $('name-input').value = '';
    $('species-select').value = 'todos';
    $('breed-input').value = '';
    $('sex-select').value = 'todos';
    $('age-select').value = 'todos';
    renderResults([]); // limpia resultados
    $('searchResults').style.display = 'none';
  });


}

document.addEventListener('DOMContentLoaded', init);
