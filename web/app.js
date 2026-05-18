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
const connectFlow = document.querySelector('#connectFlow');
const userQrImage = document.querySelector('#userQrImage');
const userQrLink = document.querySelector('#userQrLink');
const connectionList = document.querySelector('#connectionList');

const eventDialog = document.querySelector('#eventDialog');
const closeDialogButton = document.querySelector('#closeDialogButton');
const dialogType = document.querySelector('#dialogType');
const dialogTitle = document.querySelector('#dialogTitle');
const dialogBody = document.querySelector('#dialogBody');

let activeFilter = 'all';
let activeInvite = getInviteFromUrl();
let activeConnection = getConnectionFromUrl();
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

function getConnectionFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('connect');

    if (!email) {
        return null;
    }

    return {
        email: normalizeEmail(email),
        username: params.get('name')?.trim() || ''
    };
}

function makeInviteLink(eventId, email) {
    const url = new URL(window.location.href);
    url.searchParams.set('event', eventId);
    url.searchParams.set('invite', email);
    return url.toString();
}

function makeQrConnectLink(user) {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('connect', user.email);
    url.searchParams.set('name', user.username);
    return url.toString();
}

function makeQrImageUrl(value) {
    const url = new URL('https://api.qrserver.com/v1/create-qr-code/');
    url.searchParams.set('size', '220x220');
    url.searchParams.set('data', value);
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
    if (!user) {
        return null;
    }

    const normalizedUser = normalizeUser(user);
    return findUserByEmail(normalizedUser.email) || normalizedUser;
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
        exp: Number.isFinite(Number(user.exp)) ? Number(user.exp) : 0,
        connectedUsers: Array.isArray(user.connectedUsers)
            ? user.connectedUsers.map(normalizeEmail).filter(Boolean)
            : []
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
        users[existingIndex] = {
            ...users[existingIndex],
            ...normalizedUser,
            connectedUsers: normalizedUser.connectedUsers.length
                ? normalizedUser.connectedUsers
                : users[existingIndex].connectedUsers
        };
    } else {
        users.push(normalizedUser);
    }

    writeStore(STORAGE_KEYS.users, users);
    writeStore(STORAGE_KEYS.currentUser, findUserInList(users, normalizedUser.email) || normalizedUser);
}

function findUserInList(users, email) {
    return users.find((user) => user.email === email);
}

function saveUsers(users) {
    writeStore(STORAGE_KEYS.users, users.map(normalizeUser));

    const currentUser = readStore(STORAGE_KEYS.currentUser, null);
    if (currentUser) {
        const updatedCurrentUser = findUserInList(users, normalizeEmail(currentUser.email));
        if (updatedCurrentUser) {
            writeStore(STORAGE_KEYS.currentUser, normalizeUser(updatedCurrentUser));
        }
    }
}

function ensureScannedUser(connection) {
    if (!connection || !isValidEmail(connection.email)) {
        return null;
    }

    const users = getUsers();
    const existingUser = findUserInList(users, connection.email);
    if (existingUser) {
        if (connection.username && existingUser.username !== connection.username) {
            existingUser.username = connection.username;
            saveUsers(users);
        }

        return existingUser;
    }

    const scannedUser = normalizeUser({
        username: connection.username || connection.email.split('@')[0],
        email: connection.email,
        exp: 0,
        connectedUsers: []
    });

    users.push(scannedUser);
    saveUsers(users);
    return scannedUser;
}

function connectUsers(firstEmail, secondEmail) {
    if (firstEmail === secondEmail) {
        return false;
    }

    const users = getUsers();
    const firstUser = findUserInList(users, firstEmail);
    const secondUser = findUserInList(users, secondEmail);

    if (!firstUser || !secondUser) {
        return false;
    }

    const alreadyConnected = firstUser.connectedUsers.includes(secondEmail);

    if (alreadyConnected) {
        return false;
    }

    firstUser.connectedUsers = Array.from(new Set([...firstUser.connectedUsers, secondEmail]));
    secondUser.connectedUsers = Array.from(new Set([...secondUser.connectedUsers, firstEmail]));

    firstUser.exp += 10;
    secondUser.exp += 10;

    saveUsers(users);
    return true;
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
    const isInvitedEvent = activeInvite?.eventId === event.id;

    return `
        <article class="event-card ${isInvitedEvent ? 'invited-event' : ''}" id="event-${escapeHtml(event.id)}">
            <div class="event-meta">
                <span class="pill ${escapeHtml(event.type)}">${escapeHtml(event.type)}</span>
                <span class="pill">${escapeHtml(event.startDate)} to ${escapeHtml(event.endDate)}</span>
            </div>
            <h3>${escapeHtml(event.name)}</h3>
            <p>${escapeHtml(event.description)}</p>
            <p>${escapeHtml(locationText)}</p>
            ${event.tasks.length ? `<p>${event.tasks.length} task${event.tasks.length === 1 ? '' : 's'} available</p>` : ''}
            <div class="event-actions">
                <button class="secondary-button" type="button" data-info="${escapeHtml(event.id)}">Info</button>
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
    renderProfile(user);
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

function renderProfile(user) {
    if (!user) {
        return;
    }

    if (userQrImage && userQrLink) {
        const qrLink = makeQrConnectLink(user);
        userQrImage.src = makeQrImageUrl(qrLink);
        userQrLink.href = qrLink;
        userQrLink.textContent = qrLink;
    }

    renderConnectFlow(user);
    renderConnections(user);
}

function renderConnectFlow(user) {
    if (!connectFlow) {
        return;
    }

    if (!activeConnection) {
        connectFlow.classList.add('hidden');
        connectFlow.innerHTML = '';
        return;
    }

    const targetUser = ensureScannedUser(activeConnection);
    if (!targetUser) {
        connectFlow.classList.remove('hidden');
        connectFlow.innerHTML = '<p class="form-message">This QR code is not valid.</p>';
        return;
    }

    const isSelf = targetUser.email === user.email;
    const isConnected = user.connectedUsers.includes(targetUser.email);

    if (isSelf) {
        connectFlow.classList.remove('hidden');
        connectFlow.innerHTML = `
            <p class="eyebrow">QR opened</p>
            <h3>You scanned your own QR code</h3>
            <p class="helper-text">Share this QR with someone else so they can connect with you.</p>
        `;
        return;
    }

    connectFlow.classList.remove('hidden');
    connectFlow.innerHTML = `
        <p class="eyebrow">QR scanned</p>
        <h3>Connect with ${escapeHtml(targetUser.username)}</h3>
        <p class="helper-text">${escapeHtml(targetUser.email)}</p>
        <button type="button" data-connect-user="${escapeHtml(targetUser.email)}" ${isConnected ? 'disabled' : ''}>
            ${isConnected ? 'Connected' : 'Connect with user'}
        </button>
    `;
}

function renderConnections(user) {
    if (!connectionList) {
        return;
    }

    const users = getUsers();
    const connectedUsers = user.connectedUsers
        .map((email) => findUserInList(users, email) || { username: email, email })
        .sort((first, second) => first.username.localeCompare(second.username));

    connectionList.innerHTML = connectedUsers.length
        ? connectedUsers.map((connectedUser) => `
            <li>
                <strong>${escapeHtml(connectedUser.username)}</strong>
                <span>${escapeHtml(connectedUser.email)}</span>
            </li>
        `).join('')
        : '<li class="empty-state">No connected users yet.</li>';
}

function isOrganizer(event, user) {
    return Boolean(user && event.organizerEmail && event.organizerEmail === user.email);
}

function renderTaskList(tasks) {
    const taskItems = tasks.map((task) => `
        <li>
            <strong>${escapeHtml(task.name)}</strong>
            <span>${escapeHtml(task.description)}</span>
            <span class="task-exp">${escapeHtml(task.exp)} XP</span>
        </li>
    `).join('');

    return taskItems ? `<ul class="task-list">${taskItems}</ul>` : '<p>No tasks added yet.</p>';
}

function renderInviteLinks(event) {
    const inviteLinks = event.inviteEmails.map((email) => {
        const link = makeInviteLink(event.id, email);
        return `
            <li>
                <strong>${escapeHtml(email)}</strong>
                <a href="${escapeHtml(link)}">${escapeHtml(link)}</a>
            </li>
        `;
    }).join('');

    return inviteLinks ? `<ul class="invite-list">${inviteLinks}</ul>` : '<p>No invite emails added.</p>';
}

function openEventDialog(eventId) {
    if (!eventDialog || !dialogType || !dialogTitle || !dialogBody) {
        return;
    }

    const event = getEvents().find((item) => item.id === eventId);
    const user = getCurrentUser();

    if (!event) {
        return;
    }

    const locationText = event.location ? event.location : 'No location yet';
    const organizerText = event.organizerEmail ? event.organizerEmail : 'Starter event';
    const inviteSection = isOrganizer(event, user)
        ? `
            <section class="dialog-section">
                <h3>Invite links</h3>
                ${renderInviteLinks(event)}
            </section>
        `
        : '';

    dialogType.textContent = event.type;
    dialogTitle.textContent = event.name;
    dialogBody.innerHTML = `
        <section class="dialog-section">
            <h3>Description</h3>
            <p>${escapeHtml(event.description)}</p>
        </section>
        <section class="dialog-section">
            <h3>Details</h3>
            <p>${escapeHtml(event.startDate)} to ${escapeHtml(event.endDate)}</p>
            <p>${escapeHtml(locationText)}</p>
            <p>Organizer: ${escapeHtml(organizerText)}</p>
        </section>
        <section class="dialog-section">
            <h3>Tasks</h3>
            ${renderTaskList(event.tasks)}
        </section>
        ${inviteSection}
    `;

    eventDialog.showModal();
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
    } else if (!user && activeConnection?.email) {
        document.querySelector('#emailInput').value = '';
        loginMessage.textContent = 'Log in or sign up, then you can connect with the user from this QR code.';
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
    const infoButton = event.target.closest('[data-info]');
    if (infoButton) {
        openEventDialog(infoButton.dataset.info);
        return;
    }

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

if (connectFlow) {
    connectFlow.addEventListener('click', (event) => {
        const button = event.target.closest('[data-connect-user]');
        if (!button) {
            return;
        }

        const user = getCurrentUser();
        const targetEmail = normalizeEmail(button.dataset.connectUser);

        if (!user || !targetEmail) {
            return;
        }

        connectUsers(user.email, targetEmail);
        renderDashboard();
    });
}

if (closeDialogButton && eventDialog) {
    closeDialogButton.addEventListener('click', () => {
        eventDialog.close();
    });
}

if (eventDialog) {
    eventDialog.addEventListener('click', (event) => {
        if (event.target === eventDialog) {
            eventDialog.close();
        }
    });
}

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
