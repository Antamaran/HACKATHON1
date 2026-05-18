// Keys used for all browser-side data. This keeps localStorage names consistent.
const STORAGE_KEYS = {
    currentUser: 'eventConnect.currentUser',
    users: 'eventConnect.users',
    events: 'eventConnect.events',
    registrations: 'eventConnect.registrations'
};

const SESSION_KEYS = {
    pendingSignup: 'eventConnect.pendingSignup'
};

// Starter events shown the first time someone opens the site in this browser.
const seedEvents = [
    {
        id: 'coffee-match',
        name: 'Coffee Match',
        description: 'Meet another participant for a quick conversation before the next session.',
        startDate: '2026-06-01',
        endDate: '2026-06-01',
        location: 'Main hall',
        type: 'leisure',
        organizerEmail: '',
        tasks: [
            {
                name: 'Meet three people',
                description: 'Introduce yourself to three participants during the coffee break.',
                exp: 30
            }
        ]
    },
    {
        id: 'product-workshop',
        name: 'Product Workshop',
        description: 'Build a tiny demo with a small group and share it at the end.',
        startDate: '2026-06-02',
        endDate: '2026-06-03',
        location: 'Room B',
        type: 'profesional',
        organizerEmail: '',
        tasks: [
            {
                name: 'Ship a demo',
                description: 'Create and present a small working prototype.',
                exp: 80
            }
        ]
    },
    {
        id: 'team-quiz',
        name: 'Team Quiz',
        description: 'Answer event-themed questions and collect points with a rotating team.',
        startDate: '2026-06-03',
        endDate: '2026-06-03',
        location: '',
        type: 'leisure',
        organizerEmail: '',
        tasks: [
            {
                name: 'Join a quiz team',
                description: 'Register with a team and complete one quiz round.',
                exp: 40
            }
        ]
    }
];

const loginView = document.querySelector('#loginView');
const dashboardView = document.querySelector('#dashboardView');
const loginForm = document.querySelector('#loginForm');
const verificationForm = document.querySelector('#verificationForm');
const eventForm = document.querySelector('#eventForm');
const eventGrid = document.querySelector('#eventGrid');
const welcomeTitle = document.querySelector('#welcomeTitle');
const loginMessage = document.querySelector('#loginMessage');
const verificationMessage = document.querySelector('#verificationMessage');
const demoCodeBox = document.querySelector('#demoCodeBox');
const cancelVerificationButton = document.querySelector('#cancelVerificationButton');
const eventMessage = document.querySelector('#eventMessage');
const logoutButton = document.querySelector('#logoutButton');
const filterButtons = document.querySelectorAll('.filter-button');
const totalEvents = document.querySelector('#totalEvents');
const registeredCount = document.querySelector('#registeredCount');
const userCount = document.querySelector('#userCount');
const userExp = document.querySelector('#userExp');
const addTaskButton = document.querySelector('#addTaskButton');
const draftTaskList = document.querySelector('#draftTaskList');

let activeFilter = 'all';
let activeInvite = getInviteFromUrl();
let draftTasks = [];

// Small wrappers around localStorage so the rest of the code can work with objects.
function readStore(key, fallback) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
}

function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function readSession(key, fallback) {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
}

function writeSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getInviteFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const inviteEmail = params.get('invite');

    if (!eventId) {
        return null;
    }

    return {
        eventId,
        inviteEmail: inviteEmail ? normalizeEmail(inviteEmail) : ''
    };
}

function makeInviteLink(eventId, email) {
    const url = new URL(window.location.href);
    url.searchParams.set('event', eventId);
    url.searchParams.set('invite', email);
    return url.toString();
}

function parseInviteEmails(value) {
    return value
        .split(/[\n,;]+/)
        .map(normalizeEmail)
        .filter(Boolean)
        .filter((email, index, emails) => emails.indexOf(email) === index);
}

function getCurrentUser() {
    const user = readStore(STORAGE_KEYS.currentUser, null);
    return user ? normalizeUser(user) : null;
}

function getUsers() {
    return readStore(STORAGE_KEYS.users, []).map(normalizeUser);
}

function getEvents() {
    return readStore(STORAGE_KEYS.events, seedEvents).map(normalizeEvent);
}

function getRegistrations() {
    return readStore(STORAGE_KEYS.registrations, {});
}

function findUserByEmail(email) {
    return getUsers().find((user) => user.email === email);
}

function normalizeUser(user) {
    return {
        username: user.username,
        email: user.email,
        exp: Number.isFinite(Number(user.exp)) ? Number(user.exp) : 0
    };
}

function normalizeEvent(event) {
    return {
        ...event,
        inviteEmails: event.inviteEmails || [],
        organizerEmail: event.organizerEmail || '',
        tasks: (event.tasks || []).map(normalizeTask)
    };
}

function normalizeTask(task) {
    return {
        name: task.name || '',
        description: task.description || '',
        exp: Number.isFinite(Number(task.exp)) ? Number(task.exp) : 0
    };
}

function saveUser(user) {
    const users = getUsers();
    const normalizedUser = normalizeUser(user);
    const existingIndex = users.findIndex((item) => item.email === normalizedUser.email);

    // Email acts like the unique user id: logging in again updates the username.
    if (existingIndex >= 0) {
        users[existingIndex] = normalizedUser;
    } else {
        users.push(normalizedUser);
    }

    writeStore(STORAGE_KEYS.users, users);
    writeStore(STORAGE_KEYS.currentUser, normalizedUser);
}

function generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function startEmailVerification(user) {
    const code = generateVerificationCode();

    writeSession(SESSION_KEYS.pendingSignup, {
        ...user,
        code
    });

    // Static local sites cannot send real email without a backend or email service.
    demoCodeBox.textContent = `Local demo email code for ${user.email}: ${code}`;
    verificationMessage.textContent = '';
    loginForm.classList.add('hidden');
    verificationForm.classList.remove('hidden');
    document.querySelector('#verificationCodeInput').focus();
}

function cancelEmailVerification() {
    sessionStorage.removeItem(SESSION_KEYS.pendingSignup);
    verificationForm.reset();
    verificationForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loginMessage.textContent = '';
}

function createEventId(name) {
    // Make a readable id from the event name, then add a timestamp to avoid duplicates.
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

    // Clicking the same event again unregisters the current user.
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
    const inviteEmails = event.inviteEmails || [];
    const inviteLinks = inviteEmails.map((email) => {
        const link = makeInviteLink(event.id, email);
        return `
            <li>
                <strong>${escapeHtml(email)}</strong>
                <a href="${escapeHtml(link)}">${escapeHtml(link)}</a>
            </li>
        `;
    }).join('');
    const isInvitedEvent = activeInvite?.eventId === event.id;
    const taskItems = event.tasks.map((task) => `
        <li>
            <strong>${escapeHtml(task.name)}</strong>
            <span>${escapeHtml(task.description)}</span>
            <span class="task-exp">${escapeHtml(task.exp)} XP</span>
        </li>
    `).join('');

    return `
        <article class="event-card ${isInvitedEvent ? 'invited-event' : ''}" id="event-${escapeHtml(event.id)}">
            <div class="event-meta">
                <span class="pill ${escapeHtml(event.type)}">${escapeHtml(event.type)}</span>
                <span class="pill">${escapeHtml(event.startDate)} to ${escapeHtml(event.endDate)}</span>
            </div>
            <h3>${escapeHtml(event.name)}</h3>
            <p>${escapeHtml(event.description)}</p>
            <p>${escapeHtml(locationText)}</p>
            ${event.organizerEmail ? `<p>Organizer: ${escapeHtml(event.organizerEmail)}</p>` : ''}
            ${taskItems ? `<ul class="task-list">${taskItems}</ul>` : ''}
            ${inviteLinks ? `<ul class="invite-list">${inviteLinks}</ul>` : ''}
            <div class="event-actions">
                <button type="button" class="${registered ? 'registered' : ''}" data-register="${escapeHtml(event.id)}">
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
    let visibleEvents = activeFilter === 'all'
        ? events
        : events.filter((event) => event.type === activeFilter);

    if (activeInvite) {
        visibleEvents = [...visibleEvents].sort((first, second) => {
            if (first.id === activeInvite.eventId) {
                return -1;
            }

            if (second.id === activeInvite.eventId) {
                return 1;
            }

            return 0;
        });
    }

    // Rebuild the counts and event cards from storage every time data changes.
    welcomeTitle.textContent = user ? `Welcome, ${user.username}` : 'Welcome';
    totalEvents.textContent = String(events.length);
    registeredCount.textContent = String(registeredEventIds);
    userCount.textContent = String(users.length);
    userExp.textContent = String(user?.exp || 0);
    eventGrid.innerHTML = `${renderInviteNotice(user)}${visibleEvents.map(renderEventCard).join('')}`;
}

function renderInviteNotice(user) {
    if (!activeInvite) {
        return '';
    }

    const event = getEvents().find((item) => item.id === activeInvite.eventId);
    if (!event) {
        return '<div class="invite-notice">This invite link points to an event that is not saved in this browser.</div>';
    }

    if (!user) {
        return '<div class="invite-notice">Log in or sign up to register for this invited event.</div>';
    }

    const inviteEmails = event.inviteEmails || [];
    const allowed = !activeInvite.inviteEmail || inviteEmails.length === 0 || inviteEmails.includes(user.email);
    if (!allowed) {
        return '<div class="invite-notice">This invite link was created for a different email address.</div>';
    }

    return `<div class="invite-notice">Invite opened for ${escapeHtml(event.name)}. Use the register button on this event card.</div>`;
}

function showView() {
    const user = getCurrentUser();
    const pendingSignup = readSession(SESSION_KEYS.pendingSignup, null);

    // A saved current user means the browser stays logged in after refresh.
    loginView.classList.toggle('hidden', Boolean(user));
    dashboardView.classList.toggle('hidden', !user);
    loginForm.classList.toggle('hidden', Boolean(pendingSignup));
    verificationForm.classList.toggle('hidden', !pendingSignup);

    if (pendingSignup) {
        demoCodeBox.textContent = `Local demo email code for ${pendingSignup.email}: ${pendingSignup.code}`;
    } else if (!user && activeInvite?.inviteEmail) {
        document.querySelector('#emailInput').value = activeInvite.inviteEmail;
    }

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

    const existingUser = findUserByEmail(email);
    if (!existingUser) {
        startEmailVerification({ username, email, exp: 0 });
        return;
    }

    saveUser({ ...existingUser, username });
    loginForm.reset();
    loginMessage.textContent = '';
    showView();
});

verificationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const pendingSignup = readSession(SESSION_KEYS.pendingSignup, null);
    const submittedCode = document.querySelector('#verificationCodeInput').value.trim();

    if (!pendingSignup) {
        verificationMessage.textContent = 'No signup is waiting for verification.';
        return;
    }

    if (submittedCode !== pendingSignup.code) {
        verificationMessage.textContent = 'That code is not correct.';
        return;
    }

    const { code, ...verifiedUser } = pendingSignup;
    saveUser(verifiedUser);
    sessionStorage.removeItem(SESSION_KEYS.pendingSignup);
    verificationForm.reset();
    loginForm.reset();
    showView();
});

cancelVerificationButton.addEventListener('click', cancelEmailVerification);

function renderDraftTasks() {
    draftTaskList.innerHTML = draftTasks.map((task, index) => `
        <li>
            <strong>${escapeHtml(task.name)}</strong>
            <span>${escapeHtml(task.description)}</span>
            <span class="task-exp">${escapeHtml(task.exp)} XP</span>
            <button class="secondary-button" type="button" data-remove-task="${index}">Remove</button>
        </li>
    `).join('');
}

function clearTaskInputs() {
    document.querySelector('#taskNameInput').value = '';
    document.querySelector('#taskDescriptionInput').value = '';
    document.querySelector('#taskExpInput').value = '';
}

addTaskButton.addEventListener('click', () => {
    const name = document.querySelector('#taskNameInput').value.trim();
    const description = document.querySelector('#taskDescriptionInput').value.trim();
    const exp = Number(document.querySelector('#taskExpInput').value);

    if (!name || !description || !Number.isFinite(exp) || exp < 1) {
        eventMessage.textContent = 'Task name, description, and XP value are required.';
        eventMessage.classList.remove('success-message');
        return;
    }

    draftTasks.push({
        name,
        description,
        exp: Math.floor(exp)
    });

    eventMessage.textContent = '';
    clearTaskInputs();
    renderDraftTasks();
});

draftTaskList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-task]');
    if (!button) {
        return;
    }

    draftTasks.splice(Number(button.dataset.removeTask), 1);
    renderDraftTasks();
});

eventForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const user = getCurrentUser();
    const name = document.querySelector('#eventNameInput').value.trim();
    const description = document.querySelector('#eventDescriptionInput').value.trim();
    const startDate = document.querySelector('#startDateInput').value;
    const endDate = document.querySelector('#endDateInput').value;
    const location = document.querySelector('#locationInput').value.trim();
    const type = document.querySelector('#eventTypeInput').value;
    const inviteEmails = parseInviteEmails(document.querySelector('#inviteEmailsInput').value);

    // Date inputs use YYYY-MM-DD, so string comparison works for order checking.
    if (endDate < startDate) {
        eventMessage.textContent = 'End date cannot be before start date.';
        eventMessage.classList.remove('success-message');
        return;
    }

    const invalidInviteEmail = inviteEmails.find((email) => !isValidEmail(email));
    if (invalidInviteEmail) {
        eventMessage.textContent = `Invalid invite email: ${invalidInviteEmail}`;
        eventMessage.classList.remove('success-message');
        return;
    }

    const id = createEventId(name);
    const events = getEvents();
    events.push({
        id,
        name,
        description,
        startDate,
        endDate,
        location,
        type,
        inviteEmails,
        organizerEmail: user.email,
        tasks: draftTasks.map((task) => ({ ...task }))
    });

    writeStore(STORAGE_KEYS.events, events);
    eventForm.reset();
    draftTasks = [];
    renderDraftTasks();
    eventMessage.classList.add('success-message');
    eventMessage.textContent = inviteEmails.length
        ? `Event created. ${inviteEmails.length} invite link${inviteEmails.length === 1 ? '' : 's'} added to the event card.`
        : 'Event created.';
    renderDashboard();
});

eventGrid.addEventListener('click', (event) => {
    // Event cards are rendered dynamically, so one grid listener handles all buttons.
    const button = event.target.closest('[data-register]');
    if (!button) {
        return;
    }

    const eventId = button.dataset.register;
    const targetEvent = getEvents().find((item) => item.id === eventId);
    const user = getCurrentUser();
    const inviteEmails = targetEvent?.inviteEmails || [];
    const hasInviteRestriction = activeInvite?.eventId === eventId && activeInvite.inviteEmail;

    if (hasInviteRestriction && inviteEmails.length > 0 && !inviteEmails.includes(user.email)) {
        return;
    }

    toggleRegistration(eventId);
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

// Seed only once so user-created events are not overwritten on refresh.
if (!localStorage.getItem(STORAGE_KEYS.events)) {
    writeStore(STORAGE_KEYS.events, seedEvents);
}

showView();
