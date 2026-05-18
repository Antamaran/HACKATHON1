const STORAGE_KEYS = {
    currentUser: 'eventConnect.currentUser',
    users: 'eventConnect.users',
    events: 'eventConnect.events',
    registrations: 'eventConnect.registrations'
};

const seedEvents = [
    {
        id: 'coffee-match',
        name: 'Coffee Match',
        description: 'Meet another participant for a quick conversation before the next session.',
        startDate: '2026-06-01',
        endDate: '2026-06-01',
        location: 'Main hall',
        type: 'leisure'
    },
    {
        id: 'product-workshop',
        name: 'Product Workshop',
        description: 'Build a tiny demo with a small group and share it at the end.',
        startDate: '2026-06-02',
        endDate: '2026-06-03',
        location: 'Room B',
        type: 'profesional'
    },
    {
        id: 'team-quiz',
        name: 'Team Quiz',
        description: 'Answer event-themed questions and collect points with a rotating team.',
        startDate: '2026-06-03',
        endDate: '2026-06-03',
        location: '',
        type: 'leisure'
    }
];

const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const loginForm = document.querySelector('#loginForm');
const eventForm = document.querySelector('#eventForm');
const eventGrid = document.querySelector('#eventGrid');
const welcomeTitle = document.querySelector('#welcomeTitle');
const loginMessage = document.querySelector('#loginMessage');
const eventMessage = document.querySelector('#eventMessage');
const logoutButton = document.querySelector('#logoutButton');
const filterButtons = document.querySelectorAll('.filter-button');
const totalEvents = document.querySelector('#totalEvents');
const registeredCount = document.querySelector('#registeredCount');
const userCount = document.querySelector('#userCount');

let activeFilter = 'all';

function readStore(key, fallback) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
}

function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function getCurrentUser() {
    return readStore(STORAGE_KEYS.currentUser, null);
}

function getUsers() {
    return readStore(STORAGE_KEYS.users, []);
}

function getEvents() {
    return readStore(STORAGE_KEYS.events, seedEvents);
}

function getRegistrations() {
    return readStore(STORAGE_KEYS.registrations, {});
}

function saveUser(user) {
    const users = getUsers();
    const existingIndex = users.findIndex((item) => item.email === user.email);

    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }

    writeStore(STORAGE_KEYS.users, users);
    writeStore(STORAGE_KEYS.currentUser, user);
}

function createEventId(name) {
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return `${slug || 'event'}-${Date.now().toString(36)}`;
}

function isRegistered(eventId) {
    const user = getCurrentUser();
    const registrations = getRegistrations();
    return Boolean(user && registrations[eventId]?.includes(user.email));
}

function toggleRegistration(eventId) {
    const user = getCurrentUser();
    if (!user) {
        return;
    }

    const registrations = getRegistrations();
    const eventUsers = registrations[eventId] || [];

    if (eventUsers.includes(user.email)) {
        registrations[eventId] = eventUsers.filter((email) => email !== user.email);
    } else {
        registrations[eventId] = [...eventUsers, user.email];
    }

    writeStore(STORAGE_KEYS.registrations, registrations);
    renderDashboard();
}

function renderEventCard(event) {
    const registered = isRegistered(event.id);
    const locationText = event.location ? event.location : 'No location yet';

    return `
        <article class="event-card">
            <div class="event-meta">
                <span class="pill ${event.type}">${event.type}</span>
                <span class="pill">${event.startDate} to ${event.endDate}</span>
            </div>
            <h3>${event.name}</h3>
            <p>${event.description}</p>
            <p>${locationText}</p>
            <div class="event-actions">
                <button type="button" class="${registered ? 'registered' : ''}" data-register="${event.id}">
                    ${registered ? 'Registered' : 'Register'}
                </button>
            </div>
        </article>
    `;
}

function renderDashboard() {
    const user = getCurrentUser();
    const events = getEvents();
    const users = getUsers();
    const registrations = getRegistrations();
    const registeredEventIds = events.filter((event) => registrations[event.id]?.includes(user?.email)).length;
    const visibleEvents = activeFilter === 'all'
        ? events
        : events.filter((event) => event.type === activeFilter);

    welcomeTitle.textContent = user ? `Welcome, ${user.username}` : 'Welcome';
    totalEvents.textContent = String(events.length);
    registeredCount.textContent = String(registeredEventIds);
    userCount.textContent = String(users.length);
    eventGrid.innerHTML = visibleEvents.map(renderEventCard).join('');
}

function showView() {
    const user = getCurrentUser();
    loginView.classList.toggle('hidden', Boolean(user));
    dashboardView.classList.toggle('hidden', !user);

    if (user) {
        renderDashboard();
    }
}

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.querySelector('#usernameInput').value.trim();
    const email = normalizeEmail(document.querySelector('#emailInput').value);

    if (!username || !email) {
        loginMessage.textContent = 'Please enter both your username and email.';
        return;
    }

    saveUser({ username, email });
    loginForm.reset();
    loginMessage.textContent = '';
    showView();
});

eventForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.querySelector('#eventNameInput').value.trim();
    const description = document.querySelector('#eventDescriptionInput').value.trim();
    const startDate = document.querySelector('#startDateInput').value;
    const endDate = document.querySelector('#endDateInput').value;
    const location = document.querySelector('#locationInput').value.trim();
    const type = document.querySelector('#eventTypeInput').value;

    if (endDate < startDate) {
        eventMessage.textContent = 'End date cannot be before start date.';
        return;
    }

    const events = getEvents();
    events.push({
        id: createEventId(name),
        name,
        description,
        startDate,
        endDate,
        location,
        type
    });

    writeStore(STORAGE_KEYS.events, events);
    eventForm.reset();
    eventMessage.textContent = 'Event created.';
    renderDashboard();
});

eventGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-register]');
    if (!button) {
        return;
    }

    toggleRegistration(button.dataset.register);
});

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        activeFilter = button.dataset.filter;
        renderDashboard();
    });
});

logoutButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    showView();
});

if (!localStorage.getItem(STORAGE_KEYS.events)) {
    writeStore(STORAGE_KEYS.events, seedEvents);
}

showView();
