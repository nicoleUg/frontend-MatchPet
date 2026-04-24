import { auth } from '../firebase.js';
import { getUserById, updateUserRecord } from '../services/demo-store.js';
import { searchPets, getPet } from '../services/pets.service.js';
import { adoptPet } from '../Adoption/adoption.js';
import Pet from '../models/Pet.js';
import '../services/page-guard.js';
import { userService } from '../services/user.service.js';

const profileDisplay = document.getElementById('profile-display');
const profileEmail = document.getElementById('profile-email');
const profileBio = document.getElementById('profile-bio');
const matchesCountEl = document.getElementById('matches-count');
const publishedCountEl = document.getElementById('published-count');
const adoptedCountEl = document.getElementById('adopted-count');

const loadProfileStats = async (user) => {
  if (!user) return;
  try {
    // 1) Read user profile from demo-store (localStorage)
    let data = getUserById(user.uid) || {};
    if (!Array.isArray(data.matches)) data.matches = [];
    if (!Array.isArray(data.adoptions)) data.adoptions = [];

    const matches = Array.isArray(data.matches) ? data.matches.length : 0;
    const adoptions = Array.isArray(data.adoptions) ? data.adoptions.length : 0;

    // 2) Count published pets (ownerId == user.uid)
    let published = 0;
    try {
      const pets = await searchPets({ ownerId: user.uid });
      published = Array.isArray(pets) ? pets.length : 0;
    } catch (e) {
      console.warn('No se pudieron obtener mascotas publicadas:', e);
      published = 0;
    }

    // Update UI
    if (matchesCountEl) matchesCountEl.textContent = String(matches);
    if (adoptedCountEl) adoptedCountEl.textContent = String(adoptions);
    if (publishedCountEl) publishedCountEl.textContent = String(published);

    // Render recent matches list (first 6)
    renderMatchesList(Array.isArray(data.matches) ? data.matches : []);
    // Render adopted pets list
    renderAdoptedList(Array.isArray(data.adoptions) ? data.adoptions : []);
  } catch (err) {
    console.error('Error cargando datos de perfil:', err);
  }
};

const renderAdoptedList = async (adoptIds = []) => {
  const container = document.querySelector('.adopted-list');
  if (!container) return;
  container.innerHTML = '';
  if (!adoptIds.length) {
    container.innerHTML = '<p style="color:#666">Aún no has adoptado mascotas.</p>';
    return;
  }
  for (const pid of adoptIds.slice(0, 12)) {
    try {
      const pet = await getPet(pid);
      if (!pet) continue;
      const card = document.createElement('div');
      card.className = 'adopted-card';
      const bg = pet.photoUrl || 'https://placehold.co/800x450/A3A3A3/FFFFFF?text=Mascota';
      card.innerHTML = `
        <div class="bg" style="background-image:url('${bg}')"></div>
        <div class="adopted-badge">Adoptado</div>
        <div class="meta">
          <strong>${pet.name ?? 'Sin nombre'}</strong>
          <div style="font-size:0.9rem;opacity:0.9">${pet.breed ?? ''}</div>
        </div>
      `;
      container.appendChild(card);
    } catch (e) {
      console.warn('Error fetching adopted pet', e);
    }
  }
};

const renderMatchesList = async (matchIds = []) => {
  const container = document.querySelector('.matches-list');
  if (!container) return;
  container.innerHTML = '';
  if (!matchIds.length) {
    container.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">No tienes matches aún. ¡Ve a la sección Match para encontrar tu compañero perfecto!</p>';
    return;
  }

  const ids = matchIds.slice(0, 12);
  let loadedCount = 0;
  
  for (const pid of ids) {
    try {
      const pet = await getPet(pid);
      if (!pet) continue;
      
      const card = document.createElement('div');
      card.className = 'match-card';
      const bg = pet.photoUrl || 'https://placehold.co/800x450/A3A3A3/FFFFFF?text=Mascota';
      
      const dateStr = pet.createdAt ? (
        typeof pet.createdAt === 'object' && pet.createdAt.toDate
          ? pet.createdAt.toDate().toLocaleDateString('es-ES')
          : String(pet.createdAt).substring(0, 10)
      ) : 'Fecha desconocida';
      
      card.innerHTML = `
        <div class="bg" style="background-image:url('${bg}')"></div>
        <div class="badge-heart"><i class="fa-solid fa-heart"></i></div>
        <div class="meta">
          <strong>${escapeHtml(pet.name ?? 'Sin nombre')}</strong>
          <div style="font-size:0.9rem;opacity:0.9">${escapeHtml(pet.breed ?? '-')} ${escapeHtml(pet.gender ? `(${pet.gender})` : '')}</div>
          <div style="font-size:0.8rem;opacity:0.8">Match el ${dateStr}</div>
        </div>
        <button class="adopt-btn" data-pet-id="${pid}">Ver Detalles</button>
      `;

      // Click to view details
      card.querySelector('.adopt-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openMatchDetails(pet, pid);
      });

      container.appendChild(card);
      loadedCount++;
    } catch (e) {
      console.warn('Error fetch pet for matches', e);
    }
  }
  
  if (loadedCount === 0) {
    container.innerHTML = '<p style="color:#666;text-align:center;padding:2rem">No se pudieron cargar los matches.</p>';
  }
};

// Render basic profile info
const renderBasicInfo = (user) => {
  if (!user) return;
  const display = user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario');
  if (profileDisplay) profileDisplay.textContent = display;
  if (profileEmail) profileEmail.textContent = user.email || '';
  // avatar initial
  if (document.getElementById('profile-avatar')) {
    document.getElementById('profile-avatar').textContent = (display && display[0]) ? display[0].toUpperCase() : 'U';
  }
  // profileBio stays as placeholder unless we fetch from user doc (optional)
};

// Listen auth state
if (typeof auth !== 'undefined' && auth) {
  try {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        renderBasicInfo(user);
        await loadProfileStats(user);
        // bind edit button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
          editBtn.addEventListener('click', async () => {
            openInlineEditor(user);
          });
        }
        // keep modal init for legacy fallback, but prefer inline editor
        initEditModal();
      } else {
        // Not logged in — redirect to login
        window.location.href = '../login/login.html';
      }
    });
  } catch (e) {
    console.warn('Auth not available or onAuthStateChanged failed', e);
  }
}

/* Edit modal implementation */
const initEditModal = () => {
  let modal = document.getElementById('edit-modal');
  if (modal) return; // already created in DOM? If not, create DOM structure
  // Create modal HTML and append to body
  modal = document.createElement('div');
  modal.id = 'edit-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-panel">
      <h3>Editar Perfil</h3>
      <label>Nombre</label>
      <input id="edit-name" type="text" style="width:100%;padding:0.5rem;border-radius:0.35rem;border:1px solid #e5e7eb;" />
      <label>Biografía</label>
      <textarea id="edit-bio" rows="4" style="width:100%;padding:0.5rem;border-radius:0.35rem;border:1px solid #e5e7eb;"></textarea>
      <div class="modal-actions">
        <button class="btn secondary" id="edit-cancel">Cancelar</button>
        <button class="btn primary" id="edit-save">Guardar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('edit-cancel').addEventListener('click', () => {
    closeEditModal();
  });
  document.getElementById('edit-save').addEventListener('click', async () => {
    await saveProfileEdits();
  });
};

const openEditModal = async (user) => {
  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  // prefill with current values from demo-store
  const data = getUserById(user.uid) || {};
  document.getElementById('edit-name').value = user.displayName || (user.email ? user.email.split('@')[0] : '');
  document.getElementById('edit-bio').value = data.bio || '';
  modal.style.display = 'flex';
};

const closeEditModal = () => {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.style.display = 'none';
};

const saveProfileEdits = async () => {
  const name = document.getElementById('edit-name').value.trim();
  const bio = document.getElementById('edit-bio').value.trim();
  const user = auth.currentUser;
  if (!user) return;
  try {
    updateUserRecord(user.uid, { displayName: name, bio });
    auth._setCurrentUser({ ...user, displayName: name });
    // reflect on UI
    if (profileDisplay) profileDisplay.textContent = name;
    if (profileBio) profileBio.textContent = bio;
    if (document.getElementById('profile-avatar')) document.getElementById('profile-avatar').textContent = (name[0]||'U').toUpperCase();
    closeEditModal();
  } catch (err) {
    console.error('Error saving profile edits', err);
  }
};

/* Inline editor implementation (preferred): open a form inside the profile card */
const openInlineEditor = async (user) => {
  const card = document.getElementById('profile-card');
  if (!card) return;
  // prevent opening twice
  if (card.querySelector('.inline-editor')) return;
  const data = getUserById(user.uid) || {};

  // Build inline editor layout: left controls (save/cancel) remain near avatar, right form fields
  const right = document.createElement('div');
  right.className = 'inline-editor';
  right.innerHTML = `
    <div class="editor-form">
      <label>Nombre completo</label>
      <input id="inline-name" type="text" value="${escapeHtml(user.displayName || (user.email?user.email.split('@')[0]:''))}" />
      <label>Teléfono</label>
      <input id="inline-phone" type="text" value="${escapeHtml(data.phone || '')}" />
      <label>Ubicación</label>
      <input id="inline-location" type="text" value="${escapeHtml(data.location || '')}" />
      <label>Biografía</label>
      <textarea id="inline-bio">${escapeHtml(data.bio || '')}</textarea>
    </div>
  `;

  // Insert editor to the right of profile-left (which contains avatar and edit button)
  const profileLeft = card.querySelector('.profile-left');
  const profileRight = card.querySelector('.profile-right');
  if (profileRight) {
    // hide original display content and append editor
    profileRight.style.display = 'none';
    profileRight.parentNode.insertBefore(right, profileRight.nextSibling);
  } else {
    card.appendChild(right);
  }

  // Replace edit button with Save/Cancel controls (left area)
  const editBtn = document.getElementById('edit-profile-btn');
  if (editBtn && profileLeft) {
    editBtn.style.display = 'none';
    const actions = document.createElement('div');
    actions.className = 'inline-actions';
    actions.innerHTML = `
      <button id="inline-save" class="btn primary">Guardar</button>
      <button id="inline-cancel" class="btn secondary">Cancelar</button>
    `;
    profileLeft.appendChild(actions);

    document.getElementById('inline-cancel').addEventListener('click', () => {
      closeInlineEditor();
    });
    document.getElementById('inline-save').addEventListener('click', async () => {
      await saveInlineEdits();
    });
  }
};

const closeInlineEditor = () => {
  const card = document.getElementById('profile-card');
  if (!card) return;
  const editor = card.querySelector('.inline-editor');
  if (editor) editor.remove();
  const profileRight = card.querySelector('.profile-right');
  if (profileRight) profileRight.style.display = '';
  const actions = card.querySelector('.inline-actions');
  if (actions) actions.remove();
  const editBtn = document.getElementById('edit-profile-btn');
  if (editBtn) editBtn.style.display = '';
};

const saveInlineEdits = async () => {
  const name = document.getElementById('inline-name').value.trim();
  const phone = document.getElementById('inline-phone').value.trim();
  const location = document.getElementById('inline-location').value.trim();
  const bio = document.getElementById('inline-bio').value.trim();
  const user = auth.currentUser;
  if (!user) return;
  try {
    updateUserRecord(user.uid, { displayName: name, phone, location, bio });
    auth._setCurrentUser({ ...user, displayName: name });
    // reflect on UI
    if (profileDisplay) profileDisplay.textContent = name;
    if (profileEmail) profileEmail.textContent = user.email || '';
    if (profileBio) profileBio.textContent = bio;
    if (document.getElementById('profile-avatar')) document.getElementById('profile-avatar').textContent = (name[0]||'U').toUpperCase();
    closeInlineEditor();
  } catch (err) {
    console.error('Error saving inline edits', err);
    alert('Error al guardar. Intenta nuevamente.');
  }
};

// small helper to avoid XSS when inserting values
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, function(tag) {
    const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return charsToReplace[tag] || tag;
  });
}

// --- Match Details Modal ---
const openMatchDetails = (pet, petId) => {
  closeMatchDetails();
  const modal = document.createElement('div');
  modal.id = 'match-details-modal';
  modal.className = 'match-details-modal';
  const bg = pet.photoUrl || 'https://placehold.co/800x450/A3A3A3/FFFFFF?text=Mascota';
  modal.innerHTML = `
    <div class="match-details-backdrop"></div>
    <div class="match-details-panel">
      <button class="match-details-close" title="Cerrar">✕</button>
      <div class="match-details-img" style="background-image:url('${escapeHtml(bg)}')"></div>
      <div class="match-details-body">
        <h3>${escapeHtml(pet.name || 'Mascota')}</h3>
        <div class="match-details-info">
          <p><strong>Edad:</strong> ${escapeHtml(pet.age || 'No especificada')}</p>
          <p><strong>Especie:</strong> ${escapeHtml(pet.species || 'No especificada')}</p>
          <p><strong>Raza:</strong> ${escapeHtml(pet.breed || 'No especificada')}</p>
          <p><strong>Género:</strong> ${escapeHtml(pet.gender ? (pet.gender === 'macho' ? 'Macho' : pet.gender === 'hembra' ? 'Hembra' : pet.gender) : 'No especificado')}</p>
          <p><strong>Descripción:</strong></p>
          <p style="font-style:italic;color:#666">"${escapeHtml(pet.personality || 'Sin descripción')}"</p>
        </div>
        <div class="match-details-actions">
          <button class="btn secondary" id="close-details">Cerrar</button>
          <button class="btn primary" id="adopt-from-details" data-pet-id="${petId}">Adoptar esta Mascota</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.querySelector('.match-details-close').addEventListener('click', closeMatchDetails);
  modal.querySelector('#close-details').addEventListener('click', closeMatchDetails);
  modal.querySelector('#adopt-from-details').addEventListener('click', (e) => {
    const petId = e.currentTarget.getAttribute('data-pet-id');
    closeMatchDetails();
    // Find the pet card and call adopt
    const matchCard = document.querySelector(`.match-card button[data-pet-id="${petId}"]`);
    if (matchCard && matchCard.closest('.match-card')) {
      openAdoptConfirm(pet, petId, matchCard.closest('.match-card'));
    }
  });
};

const closeMatchDetails = () => {
  const ex = document.getElementById('match-details-modal');
  if (ex) ex.remove();
};


const openAdoptConfirm = (pet, petId, card) => {
  closeAdoptConfirm();
  const modal = document.createElement('div');
  modal.id = 'adopt-confirm-modal';
  modal.className = 'adopt-modal';
  modal.innerHTML = `
    <div class="adopt-backdrop"></div>
    <div class="adopt-panel">
      <div class="adopt-img" style="background-image:url('${escapeHtml(pet.photoUrl || 'https://placehold.co/800x450/A3A3A3/FFFFFF?text=Mascota')}')">
        <button class="adopt-close" title="Cerrar">✕</button>
      </div>
      <div class="adopt-body">
        <h3>${escapeHtml(pet.name || 'Mascota')}</h3>
        <p class="adopt-sub">¿Listo para adoptar a ${escapeHtml(pet.name || 'esta mascota')}?</p>
        <p class="adopt-note">Este es un gran paso. Asegúrate de estar preparado para darle un hogar amoroso.</p>
        <div class="adopt-info">
          <strong>Compromiso de por vida</strong>
          <ul>
            <li>Cuidados veterinarios regulares</li>
            <li>Alimentación y ejercicio diario</li>
            <li>Amor y atención constante</li>
            <li>Ambiente seguro y cómodo</li>
          </ul>
        </div>
        <div class="adopt-actions">
          <button id="adopt-cancel" class="btn secondary">Aún no</button>
          <button id="adopt-confirm" class="btn primary">Sí, adoptar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // handlers
  modal.querySelector('.adopt-close').addEventListener('click', closeAdoptConfirm);
  modal.querySelector('#adopt-cancel').addEventListener('click', closeAdoptConfirm);
  modal.querySelector('#adopt-confirm').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    await performAdopt(pet, petId, card, btn);
  });
};

const closeAdoptConfirm = () => {
  const existing = document.getElementById('adopt-confirm-modal');
  if (existing) existing.remove();
};

const showToast = (text, ms = 2200) => {
  const id = 'profile-toast';
  let toast = document.getElementById(id);
  if (!toast) {
    toast = document.createElement('div');
    toast.id = id;
    toast.className = 'profile-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, ms);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const finalizeAdoptionUi = (pet, card, { partial = false } = {}) => {
  const matchesEl = document.getElementById('matches-count');
  const adoptedEl = document.getElementById('adopted-count');
  if (matchesEl) matchesEl.textContent = String(Math.max(0, Number(matchesEl.textContent || '0') - 1));
  if (adoptedEl) adoptedEl.textContent = String(Number(adoptedEl.textContent || '0') + 1);

  const toastMsg = partial
    ? `Registramos tu solicitud para ${pet.name || 'la mascota'}. Espera confirmación.`
    : `¡${pet.name} ahora es parte de tu familia!`;
  const toastDuration = partial ? 2600 : 1800;

  showToast(toastMsg, toastDuration);
  closeAdoptConfirm();

  const adoptBtn = card.querySelector('.adopt-btn');
  if (adoptBtn) {
    adoptBtn.textContent = partial ? 'Pendiente' : 'Adoptado';
    adoptBtn.classList.add('adopted');
    adoptBtn.disabled = true;
  }
  setTimeout(() => {
    if (card && card.parentNode) card.remove();
  }, 900);

  showAdoptSuccess(pet, { partial });
};

const performAdopt = async (pet, petId, card, confirmBtn) => {
  try {
  // simulate short processing for UX (<= 2s)
  const simulated = sleep(1200 + Math.floor(Math.random() * 700));
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  // prevent adopting own pet
  if (pet.ownerId && pet.ownerId === user.uid) throw new Error('No puedes adoptar tu propia mascota');
  const adoptPromise = adoptPet(user.uid, petId);
  await Promise.all([adoptPromise, simulated]);
    finalizeAdoptionUi(pet, card, { partial: false });
  } catch (err) {
    if (err && err.code === 'permission-denied') {
      try {
        const user = auth.currentUser;
        if (!user) throw err;
        await Promise.all([
          userService.addAdoptedPet(user.uid, petId),
          sleep(800 + Math.floor(Math.random() * 600)),
        ]);
        finalizeAdoptionUi(pet, card, { partial: true });
        if (confirmBtn) confirmBtn.textContent = 'Registrado';
        return;
      } catch (fallbackErr) {
        console.error('Fallback adopt registration failed', fallbackErr);
      }
    }
    console.error('Adopt failed', err);
    if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Sí, adoptar'; }
    alert('No se pudo completar la adopción. Intenta nuevamente.');
  }
};

const showAdoptSuccess = (pet, { partial = false } = {}) => {
  closeAdoptSuccess();
  const modal = document.createElement('div');
  modal.id = 'adopt-success-modal';
  modal.className = 'adopt-success';
  const title = partial ? '¡Solicitud enviada!' : '¡Felicitaciones!';
  const body = partial
    ? `Registramos tu solicitud para adoptar a <strong>${escapeHtml(pet.name || 'la mascota')}</strong>. Nos pondremos en contacto tras la confirmación del publicador.`
    : `Has adoptado oficialmente a <strong>${escapeHtml(pet.name || 'la mascota')}</strong>. Pronto recibirás información sobre los siguientes pasos.`;
  const note = partial
    ? 'Revisa tu bandeja de entrada para conocer el estado de la adopción.'
    : 'Te contactaremos pronto con los detalles de la adopción.';
  modal.innerHTML = `
    <div class="adopt-success-backdrop"></div>
    <div class="adopt-success-panel">
      <div class="success-icon">✓</div>
      <h3>${title}</h3>
      <p>${body}</p>
      <div class="success-note">${note}</div>
      <div style="display:flex;justify-content:center;margin-top:1rem">
        <button id="success-close" class="btn primary">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#success-close').addEventListener('click', closeAdoptSuccess);
};

const closeAdoptSuccess = () => {
  const ex = document.getElementById('adopt-success-modal');
  if (ex) ex.remove();
};
