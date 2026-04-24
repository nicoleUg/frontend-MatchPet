// src/firebase.js
// Demo-only replacement for Firebase.
//
// This project used to rely on Firebase Auth/Firestore; for a self-contained
// frontend demo we emulate the minimal Auth surface area used by the app.

const USER_KEY = 'user';

const safeParse = (raw) => {
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

let currentUser = null;
const listeners = new Set();

const readFromStorage = () => {
    if (typeof localStorage === 'undefined') {
        return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== 'object') {
        return null;
    }
    if (!parsed.uid) {
        return null;
    }
    return {
        uid: String(parsed.uid),
        email: parsed.email ? String(parsed.email) : null,
        displayName: parsed.displayName ? String(parsed.displayName) : null,
    };
};

const writeToStorage = (user) => {
    if (typeof localStorage === 'undefined') {
        return;
    }
    if (!user) {
        localStorage.removeItem(USER_KEY);
        return;
    }
    localStorage.setItem(
        USER_KEY,
        JSON.stringify({
            uid: user.uid,
            email: user.email ?? null,
            displayName: user.displayName ?? null,
        })
    );
};

const notify = () => {
    for (const cb of listeners) {
        try {
            cb(currentUser);
        } catch (e) {
            // Ignore listener errors to avoid breaking the app
            console.warn('onAuthStateChanged callback failed', e);
        }
    }
};

// Initialize from localStorage (if present)
currentUser = readFromStorage();

export const auth = {
    get currentUser() {
        return currentUser;
    },

    onAuthStateChanged(cb) {
        if (typeof cb !== 'function') {
            return () => {};
        }
        listeners.add(cb);
        // Fire asynchronously (Firebase-like). This avoids TDZ issues in callers
        // that store the unsubscribe function in a const and call it in the callback.
        const run = () => cb(currentUser);
        if (typeof queueMicrotask === 'function') {
            queueMicrotask(run);
        } else {
            Promise.resolve().then(run);
        }
        return () => listeners.delete(cb);
    },

    // Internal helpers used by auth.service.js
    _setCurrentUser(user) {
        currentUser = user;
        writeToStorage(user);
        notify();
    },
};

// Legacy named exports kept as null to avoid accidental imports elsewhere.
export const db = null;
export const storage = null;
export const googleProvider = null;