// Keys used for all browser-side data. This keeps localStorage names consistent.
const STORAGE_KEYS = {
    currentUser: 'eventConnect.currentUser',
    users: 'eventConnect.users',
    events: 'eventConnect.events',
    registrations: 'eventConnect.registrations',
    eventParticipants: 'eventConnect.eventParticipants',
    taskCompletions: 'eventConnect.taskCompletions',
    eventRewards: 'eventConnect.eventRewards',
    notifications: 'eventConnect.notifications',
    questionnaireAttempts: 'eventConnect.questionnaireAttempts'
};

const DAILY_ACCOUNT_XP_CAP = 200;
const EVENT_REWARD_DELAY_MS = 60 * 60 * 1000;
const NETLIFY_SITE_URL = 'https://starlit-haupia-07c2f5.netlify.app';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);
const API_BASE_URL = window.location.protocol.startsWith('http') && !LOCAL_HOSTNAMES.has(window.location.hostname)
    ? window.location.origin
    : NETLIFY_SITE_URL;
const REMOTE_REFRESH_INTERVAL_MS = 10 * 1000;
const ADMIN_ACCOUNT = {
    username: 'admin123',
    email: 'admin@adminemail.com',
    password: 'iamaadmin'
};
const REMOTE_STORAGE_KEYS = [
    STORAGE_KEYS.users,
    STORAGE_KEYS.events,
    STORAGE_KEYS.registrations,
    STORAGE_KEYS.eventParticipants,
    STORAGE_KEYS.taskCompletions,
    STORAGE_KEYS.eventRewards,
    STORAGE_KEYS.notifications,
    STORAGE_KEYS.questionnaireAttempts
];

const SESSION_KEYS = {
    pendingSignup: 'eventConnect.pendingSignup',
    pendingGuestXpSave: 'eventConnect.pendingGuestXpSave',
    pendingAccountEventJoin: 'eventConnect.pendingAccountEventJoin'
};

// Starter events shown the first time someone opens the site in this browser.
const seedEvents = [
    {
        id: 'coffee-match',
        name: 'Coffee Match',
        description: 'Meet another participant for a quick conversation before the next session.',
        startDate: '2026-06-01',
        startTime: '10:00',
        endDate: '2026-06-01',
        endTime: '11:00',
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
        startTime: '13:00',
        endDate: '2026-06-03',
        endTime: '16:30',
        location: 'Room B',
        type: 'professional',
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
        startTime: '17:00',
        endDate: '2026-06-03',
        endTime: '18:00',
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
const eventLandingView = document.querySelector('#eventLandingView');
const eventLandingTitle = document.querySelector('#eventLandingTitle');
const eventLandingDescription = document.querySelector('#eventLandingDescription');
const eventLandingMeta = document.querySelector('#eventLandingMeta');
const eventLandingMessage = document.querySelector('#eventLandingMessage');
const joinEventButton = document.querySelector('#joinEventButton');
const eventLoginButton = document.querySelector('#eventLoginButton');
const guestJoinForm = document.querySelector('#guestJoinForm');
const guestJoinMessage = document.querySelector('#guestJoinMessage');
const eventGameView = document.querySelector('#eventGameView');
const gameEventTitle = document.querySelector('#gameEventTitle');
const gameUserLabel = document.querySelector('#gameUserLabel');
const gameUserXp = document.querySelector('#gameUserXp');
const gameUserLevel = document.querySelector('#gameUserLevel');
const gameConnectionCount = document.querySelector('#gameConnectionCount');
const gameConnectFlow = document.querySelector('#gameConnectFlow');
const gameQrImage = document.querySelector('#gameQrImage');
const gameQrLink = document.querySelector('#gameQrLink');
const scanGameQrButton = document.querySelector('#scanGameQrButton');
const gameQrScannerPanel = document.querySelector('#gameQrScannerPanel');
const gameQrScannerVideo = document.querySelector('#gameQrScannerVideo');
const stopGameQrScanButton = document.querySelector('#stopGameQrScanButton');
const gameQrScanMessage = document.querySelector('#gameQrScanMessage');
const gameTaskList = document.querySelector('#gameTaskList');
const gameConnectionList = document.querySelector('#gameConnectionList');
const gameLeaderboard = document.querySelector('#gameLeaderboard');
const gameQuestionnaireBuilder = document.querySelector('#gameQuestionnaireBuilder');
const eventGameLogoutButton = document.querySelector('#eventGameLogoutButton');
const saveXpPrompt = document.querySelector('#saveXpPrompt');
const saveXpText = document.querySelector('#saveXpText');
const saveXpButton = document.querySelector('#saveXpButton');
const saveXpLaterButton = document.querySelector('#saveXpLaterButton');
const dashboardView = document.querySelector('#dashboardView');
const loginForm = document.querySelector('#loginForm');
const verificationForm = document.querySelector('#verificationForm');
const eventForm = document.querySelector('#eventForm');
const eventSearchForm = document.querySelector('#eventSearchForm');
const eventSearchInput = document.querySelector('#eventSearchInput');
const eventTypeFilterInput = document.querySelector('#eventTypeFilterInput');
const eventSourceFilterInput = document.querySelector('#eventSourceFilterInput');
const eventFromFilterInput = document.querySelector('#eventFromFilterInput');
const eventToFilterInput = document.querySelector('#eventToFilterInput');
const syncCatalogButton = document.querySelector('#syncCatalogButton');
const catalogSyncMessage = document.querySelector('#catalogSyncMessage');
const eventGrid = document.querySelector('#eventGrid');
const welcomeTitle = document.querySelector('#welcomeTitle');
const loginMessage = document.querySelector('#loginMessage');
const verificationMessage = document.querySelector('#verificationMessage');
const emailInput = document.querySelector('#emailInput');
const passwordInput = document.querySelector('#passwordInput');
const usernameInput = document.querySelector('#usernameInput');
const demoCodeBox = document.querySelector('#demoCodeBox');
const cancelVerificationButton = document.querySelector('#cancelVerificationButton');
const eventMessage = document.querySelector('#eventMessage');
const createdEventLinkPanel = document.querySelector('#createdEventLinkPanel');
const createdEventLinkInput = document.querySelector('#createdEventLinkInput');
const copyCreatedEventLinkButton = document.querySelector('#copyCreatedEventLinkButton');
const logoutButton = document.querySelector('#logoutButton');
const totalEvents = document.querySelector('#totalEvents');
const registeredCount = document.querySelector('#registeredCount');
const userCount = document.querySelector('#userCount');
const userExp = document.querySelector('#userExp');
const userLevel = document.querySelector('#userLevel');
const addTaskButton = document.querySelector('#addTaskButton');
const draftTaskList = document.querySelector('#draftTaskList');
const connectFlow = document.querySelector('#connectFlow');
const userQrImage = document.querySelector('#userQrImage');
const userQrLink = document.querySelector('#userQrLink');
const copyQrLinkButton = document.querySelector('#copyQrLinkButton');
const connectionUrlForm = document.querySelector('#connectionUrlForm');
const connectionUrlInput = document.querySelector('#connectionUrlInput');
const connectionUrlMessage = document.querySelector('#connectionUrlMessage');
const scanQrButton = document.querySelector('#scanQrButton');
const qrScannerPanel = document.querySelector('#qrScannerPanel');
const qrScannerVideo = document.querySelector('#qrScannerVideo');
const stopQrScanButton = document.querySelector('#stopQrScanButton');
const questionnaireBuilder = document.querySelector('#questionnaireBuilder');
const connectionList = document.querySelector('#connectionList');
const notificationList = document.querySelector('#notificationList');

const eventDialog = document.querySelector('#eventDialog');
const closeDialogButton = document.querySelector('#closeDialogButton');
const dialogType = document.querySelector('#dialogType');
const dialogTitle = document.querySelector('#dialogTitle');
const dialogBody = document.querySelector('#dialogBody');

let activeFilter = 'all';
let activeInvite = getInviteFromUrl();
let activeConnection = getConnectionFromUrl();
let draftTasks = [];
let activeEventSearch = '';
let activeSourceFilter = 'all';
let activeFromFilter = '';
let activeToFilter = '';
let qrScannerStream = null;
let qrScanFrameId = null;
let qrDetector = null;
let qrScannerCanvas = null;
let activeQrScanner = null;

// Small wrappers around localStorage so the rest of the code can work with objects.
function readStore(key, fallback) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
}

async function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    await syncStore(key, value);
}

function writeLocalStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function sameJson(first, second) {
    return JSON.stringify(first) === JSON.stringify(second);
}

function uniqueValues(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
}

function mergeArraysByField(existing, incoming, field) {
    const items = new Map();
    [...(existing || []), ...(incoming || [])].forEach((item) => {
        if (!item || !item[field]) {
            return;
        }

        items.set(item[field], {
            ...(items.get(item[field]) || {}),
            ...item
        });
    });

    return Array.from(items.values());
}

function mergeEvents(existing, incoming) {
    const events = new Map();
    [...(existing || []), ...(incoming || [])].forEach((event) => {
        if (!event?.id) {
            return;
        }

        const current = events.get(event.id) || {};
        const currentTime = Date.parse(current.updatedAt || current.createdAt || 0) || 0;
        const eventTime = Date.parse(event.updatedAt || event.createdAt || 0) || 0;
        const latest = eventTime >= currentTime ? event : current;
        const earliest = eventTime >= currentTime ? current : event;
        events.set(event.id, {
            ...earliest,
            ...latest,
            closedAt: current.closedAt || event.closedAt || '',
            closedBy: current.closedBy || event.closedBy || '',
            deletedAt: current.deletedAt || event.deletedAt || '',
            deletedBy: current.deletedBy || event.deletedBy || ''
        });
    });

    return Array.from(events.values());
}

function mergeRegistrations(existing, incoming) {
    const merged = {};
    const eventIds = uniqueValues([
        ...Object.keys(existing || {}),
        ...Object.keys(incoming || {})
    ]);

    eventIds.forEach((eventId) => {
        const byEmail = new Map();
        [...normalizeRegistrationRecords(existing?.[eventId]), ...normalizeRegistrationRecords(incoming?.[eventId])]
            .forEach((record) => {
                const current = byEmail.get(record.email);
                const currentTime = Date.parse(current?.updatedAt || 0) || 0;
                const recordTime = Date.parse(record.updatedAt || 0) || 0;

                if (!current || recordTime >= currentTime) {
                    byEmail.set(record.email, record);
                }
            });

        merged[eventId] = Array.from(byEmail.values());
    });

    return merged;
}

function mergeParticipants(existing, incoming) {
    const participants = new Map();
    [...(existing || []), ...(incoming || [])].forEach((participant) => {
        if (!participant?.id) {
            return;
        }

        const current = participants.get(participant.id) || {};
        participants.set(participant.id, {
            ...current,
            ...participant,
            eventXp: Math.max(Number(current.eventXp || 0), Number(participant.eventXp || 0)),
            connectedParticipantIds: uniqueValues([
                ...(current.connectedParticipantIds || []),
                ...(participant.connectedParticipantIds || [])
            ])
        });
    });

    return Array.from(participants.values());
}

function mergeUsers(existing, incoming) {
    const users = new Map();
    [...(existing || []), ...(incoming || [])].forEach((user) => {
        if (!user?.email) {
            return;
        }

        const current = users.get(user.email) || {};
        users.set(user.email, {
            ...current,
            ...user,
            exp: Math.max(Number(current.exp || 0), Number(user.exp || 0)),
            connectedUsers: uniqueValues([
                ...(current.connectedUsers || []),
                ...(user.connectedUsers || [])
            ]),
            questionnaire: user.questionnaire?.length ? user.questionnaire : current.questionnaire || []
        });
    });

    return Array.from(users.values());
}

function mergeTaskCompletions(existing, incoming) {
    const merged = { ...(existing || {}) };
    Object.entries(incoming || {}).forEach(([eventId, tasks]) => {
        merged[eventId] = { ...(merged[eventId] || {}) };
        Object.entries(tasks || {}).forEach(([taskId, completion]) => {
            const current = merged[eventId][taskId] || {};
            merged[eventId][taskId] = {
                pending: uniqueValues([...(current.pending || []), ...(completion.pending || [])]),
                approved: uniqueValues([...(current.approved || []), ...(completion.approved || [])])
            };
        });
    });
    return merged;
}

function mergeSharedValue(key, existing, incoming) {
    if (key === STORAGE_KEYS.events) {
        return mergeEvents(existing, incoming);
    }

    if (key === STORAGE_KEYS.users) {
        return mergeUsers(existing, incoming);
    }

    if (key === STORAGE_KEYS.eventParticipants) {
        return mergeParticipants(existing, incoming);
    }

    if (key === STORAGE_KEYS.registrations) {
        return mergeRegistrations(existing, incoming);
    }

    if (key === STORAGE_KEYS.taskCompletions) {
        return mergeTaskCompletions(existing, incoming);
    }

    if (key === STORAGE_KEYS.eventRewards || key === STORAGE_KEYS.notifications) {
        return Array.isArray(existing) || Array.isArray(incoming)
            ? mergeArraysByField(existing, incoming, 'id')
            : { ...(existing || {}), ...(incoming || {}) };
    }

    if (key === STORAGE_KEYS.questionnaireAttempts) {
        return { ...(incoming || {}), ...(existing || {}) };
    }

    return incoming;
}

async function syncStore(key, value) {
    if (!REMOTE_STORAGE_KEYS.includes(key)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/.netlify/functions/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key, value })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.value !== undefined) {
            writeLocalStore(key, data.value);
        }
    } catch {
        // Offline/local dev can keep using localStorage.
    }
}

async function loadRemoteState() {
    try {
        const response = await fetch(`${API_BASE_URL}/.netlify/functions/data`);
        if (!response.ok) {
            return;
        }

        const data = await response.json();
        Object.entries(data.state || {}).forEach(([key, value]) => {
            if (REMOTE_STORAGE_KEYS.includes(key) && value !== null && value !== undefined) {
                const localValue = readStore(key, Array.isArray(value) ? [] : {});
                const mergedValue = mergeSharedValue(key, localValue, value);
                writeLocalStore(key, mergedValue);

                if (!sameJson(mergedValue, value)) {
                    syncStore(key, mergedValue);
                }
            }
        });
    } catch {
        // Netlify Functions are unavailable when opening the HTML directly.
    }
}

async function refreshSharedState() {
    if (!window.location.protocol.startsWith('http')) {
        return;
    }

    await loadRemoteState();
}

function readSession(key, fallback) {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
}

function writeSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

async function sendEmail(payload) {
    const response = await fetch(`${API_BASE_URL}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'Email could not be sent.');
    }

    return data;
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function getLevel(exp) {
    return Math.floor(Math.max(0, exp) / 100) + 1;
}

function getNextLevelExp(exp) {
    return getLevel(exp) * 100;
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

function escapeAttribute(value) {
    return escapeHtml(value);
}

function normalizeEventType(type) {
    return type === 'profesional' ? 'professional' : (type || 'leisure');
}

function getEventIdFromUrl() {
    return new URLSearchParams(window.location.search).get('event') || '';
}

function getConnectTargetFromUrl() {
    return new URLSearchParams(window.location.search).get('connect') || '';
}

function isEventMode() {
    return Boolean(getEventIdFromUrl());
}

function getEventById(eventId) {
    return getEvents().find((event) => event.id === eventId) || null;
}

function isCatalogEvent(event) {
    return Boolean(event.source || event.sourceId || event.sourceUrl);
}

async function syncCatalogEvents(showMessage = false) {
    if (showMessage && catalogSyncMessage) {
        catalogSyncMessage.textContent = 'Syncing public events...';
        catalogSyncMessage.classList.remove('success-message');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/.netlify/functions/catalog-sync`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'Public event sync failed.');
        }

        await loadRemoteState();

        if (showMessage && catalogSyncMessage) {
            catalogSyncMessage.textContent = `Public events synced. ${data.added || 0} new, ${data.total || 0} total.`;
            catalogSyncMessage.classList.add('success-message');
        }

        return data;
    } catch (error) {
        if (showMessage && catalogSyncMessage) {
            catalogSyncMessage.textContent = error.message;
        }
        return null;
    }
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
    return parseConnectionUrl(window.location.href);
}

function parseConnectionUrl(value) {
    let params;
    try {
        params = new URL(value).searchParams;
    } catch {
        params = new URLSearchParams(value.startsWith('?') ? value : `?${value}`);
    }

    const email = params.get('connect') || params.get('user');

    if (!email) {
        return null;
    }

    return {
        email: normalizeEmail(email),
        username: (params.get('name') || params.get('username'))?.trim() || ''
    };
}

function parseEventConnectionUrl(value) {
    let params;
    try {
        params = new URL(value).searchParams;
    } catch {
        params = new URLSearchParams(value.startsWith('?') ? value : `?${value}`);
    }

    const eventId = params.get('event') || '';
    const participantId = params.get('connect') || '';

    if (!eventId || !participantId) {
        return null;
    }

    return { eventId, participantId };
}

function openPastedConnectionUrl(value) {
    const connection = parseConnectionUrl(value.trim());

    if (!connection || !isValidEmail(connection.email)) {
        connectionUrlMessage.textContent = 'Paste a valid connection URL.';
        return;
    }

    activeConnection = connection;
    connectionUrlMessage.textContent = '';
    renderDashboard();
}

function openScannedEventConnectionUrl(value) {
    const scannedConnection = parseEventConnectionUrl(value.trim());
    const eventId = getEventIdFromUrl();
    const event = getEventById(eventId);
    const participant = getCurrentEventParticipant(eventId);

    if (!scannedConnection || !event || !participant || scannedConnection.eventId !== eventId) {
        setGameQrScanMessage('Scan a valid QR code for this event.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set('connect', scannedConnection.participantId);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    setGameQrScanMessage('');
    renderEventGameDashboard(event, participant);
}

function setConnectionUrlMessage(message) {
    if (connectionUrlMessage) {
        connectionUrlMessage.textContent = message;
    }
}

function setGameQrScanMessage(message) {
    if (gameQrScanMessage) {
        gameQrScanMessage.textContent = message;
    }
}

function stopQrScanner() {
    if (qrScanFrameId) {
        cancelAnimationFrame(qrScanFrameId);
        qrScanFrameId = null;
    }

    if (qrScannerStream) {
        qrScannerStream.getTracks().forEach((track) => track.stop());
        qrScannerStream = null;
    }

    if (activeQrScanner?.video) {
        activeQrScanner.video.srcObject = null;
    }

    activeQrScanner?.panel?.classList.add('hidden');
    if (activeQrScanner?.button) {
        activeQrScanner.button.disabled = false;
    }
    activeQrScanner = null;
}

async function scanQrFrame() {
    if (!activeQrScanner?.video || !qrScannerStream) {
        return;
    }

    try {
        const scannedValue = await detectQrValue(activeQrScanner.video);

        if (scannedValue) {
            const { onScan } = activeQrScanner;
            stopQrScanner();
            onScan(scannedValue);
            return;
        }
    } catch {
        activeQrScanner.setMessage('Could not read the QR code yet. Keep it centered in the camera.');
    }

    qrScanFrameId = requestAnimationFrame(scanQrFrame);
}

async function detectQrValue(video) {
    if (qrDetector) {
        const codes = await qrDetector.detect(video);
        return codes.find((code) => code.rawValue)?.rawValue || '';
    }

    if (!window.jsQR || !video.videoWidth || !video.videoHeight) {
        return '';
    }

    qrScannerCanvas ||= document.createElement('canvas');
    qrScannerCanvas.width = video.videoWidth;
    qrScannerCanvas.height = video.videoHeight;

    const context = qrScannerCanvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(video, 0, 0, qrScannerCanvas.width, qrScannerCanvas.height);

    const imageData = context.getImageData(0, 0, qrScannerCanvas.width, qrScannerCanvas.height);
    const code = window.jsQR(imageData.data, imageData.width, imageData.height);
    return code?.data || '';
}

function createQrDetector() {
    if (!('BarcodeDetector' in window)) {
        return null;
    }

    try {
        return new BarcodeDetector({ formats: ['qr_code'] });
    } catch {
        return null;
    }
}

async function startQrScannerSession(scanner) {
    if (!navigator.mediaDevices?.getUserMedia) {
        scanner.setMessage('Camera access is not available. Paste the connection URL instead.');
        return;
    }

    if (!('BarcodeDetector' in window) && !window.jsQR) {
        scanner.setMessage('QR scanning could not load. Check your connection, then try again.');
        return;
    }

    try {
        stopQrScanner();
        activeQrScanner = scanner;
        qrDetector = createQrDetector();
        qrScannerStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' }
            },
            audio: false
        });

        scanner.video.srcObject = qrScannerStream;
        await scanner.video.play();
        scanner.panel?.classList.remove('hidden');
        scanner.button.disabled = true;
        scanner.setMessage(scanner.prompt);
        qrScanFrameId = requestAnimationFrame(scanQrFrame);
    } catch {
        stopQrScanner();
        scanner.setMessage('Camera access was blocked or unavailable. Paste the connection URL instead.');
    }
}

async function startQrScanner() {
    await startQrScannerSession({
        video: qrScannerVideo,
        panel: qrScannerPanel,
        button: scanQrButton,
        setMessage: setConnectionUrlMessage,
        prompt: 'Point your camera at a connection QR code.',
        onScan: (scannedValue) => {
            if (connectionUrlInput) {
                connectionUrlInput.value = scannedValue;
            }
            openPastedConnectionUrl(scannedValue);
        }
    });
}

async function startEventQrScanner() {
    const event = getEventById(getEventIdFromUrl());
    const participant = getCurrentEventParticipant(getEventIdFromUrl());

    if (!event || !participant) {
        setGameQrScanMessage('Join this event before scanning QR codes.');
        return;
    }

    if (isEventClosed(event)) {
        setGameQrScanMessage('This event is closed, so new connections are disabled.');
        return;
    }

    await startQrScannerSession({
        video: gameQrScannerVideo,
        panel: gameQrScannerPanel,
        button: scanGameQrButton,
        setMessage: setGameQrScanMessage,
        prompt: 'Point your camera at another attendee event QR code.',
        onScan: openScannedEventConnectionUrl
    });
}

function makeInviteLink(eventId, email) {
    const url = new URL('/web/', API_BASE_URL);
    url.searchParams.set('event', eventId);
    url.searchParams.set('invite', email);
    return url.toString();
}

function makeEventGameLink(eventId) {
    const url = new URL('/web/', API_BASE_URL);
    url.searchParams.set('event', eventId);
    return url.toString();
}

function makeQrConnectLink(user) {
    const url = new URL('/web/', API_BASE_URL);
    url.searchParams.set('connect', user.email);
    url.searchParams.set('name', user.username);
    return url.toString();
}

function makeParticipantQrLink(eventId, participantId) {
    const url = new URL('/web/', API_BASE_URL);
    url.searchParams.set('event', eventId);
    url.searchParams.set('connect', participantId);
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

function parseInterests(value) {
    return String(value || '')
        .split(',')
        .map((interest) => interest.trim())
        .filter(Boolean);
}

function normalizeRegistrationRecords(value) {
    return (value || [])
        .map((item) => {
            if (typeof item === 'string') {
                return {
                    email: normalizeEmail(item),
                    status: 'registered',
                    updatedAt: ''
                };
            }

            return {
                email: item.email ? normalizeEmail(item.email) : '',
                status: item.status === 'unregistered' ? 'unregistered' : 'registered',
                updatedAt: item.updatedAt || ''
            };
        })
        .filter((record) => record.email);
}

function getRegisteredEmails(eventId) {
    return normalizeRegistrationRecords(getRegistrations()[eventId])
        .filter((record) => record.status === 'registered')
        .map((record) => record.email);
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
    return readStore(STORAGE_KEYS.events, seedEvents).map(normalizeEvent).filter((event) => !event.deletedAt);
}

function getAllEvents() {
    return readStore(STORAGE_KEYS.events, seedEvents).map(normalizeEvent);
}

function getRegistrations() {
    return readStore(STORAGE_KEYS.registrations, {});
}

function getEventParticipants() {
    return readStore(STORAGE_KEYS.eventParticipants, []).map(normalizeParticipant);
}

function getTaskCompletions() {
    return readStore(STORAGE_KEYS.taskCompletions, {});
}

function getEventRewards() {
    return readStore(STORAGE_KEYS.eventRewards, {});
}

function getNotifications() {
    return readStore(STORAGE_KEYS.notifications, []);
}

function getQuestionnaireAttempts() {
    return readStore(STORAGE_KEYS.questionnaireAttempts, {});
}

function findUserByEmail(email) {
    return getUsers().find((user) => user.email === email);
}

function createQuestionId() {
    if (window.crypto?.randomUUID) {
        return `question-${window.crypto.randomUUID()}`;
    }

    return `question-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeAnswer(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeQuestionnaire(questionnaire) {
    return (Array.isArray(questionnaire) ? questionnaire : [])
        .map((item) => ({
            id: item.id || createQuestionId(),
            question: String(item.question || '').trim(),
            answer: String(item.answer || '').trim()
        }))
        .filter((item) => item.question && item.answer)
        .slice(0, 7);
}

function normalizeUser(user) {
    return {
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash || '',
        exp: Number.isFinite(Number(user.exp)) ? Number(user.exp) : 0,
        connectedUsers: Array.isArray(user.connectedUsers)
            ? user.connectedUsers.map(normalizeEmail).filter(Boolean)
            : [],
        role: user.role || '',
        interests: Array.isArray(user.interests)
            ? user.interests
            : parseInterests(user.interests || ''),
        goal: user.goal || '',
        currentEventId: user.currentEventId || '',
        isGuest: Boolean(user.isGuest),
        questionnaire: normalizeQuestionnaire(user.questionnaire)
    };
}

function normalizeEvent(event) {
    return {
        ...event,
        type: normalizeEventType(event.type),
        inviteEmails: event.inviteEmails || [],
        organizerEmail: event.organizerEmail || '',
        managerEmails: (event.managerEmails || []).map(normalizeEmail),
        closedAt: event.closedAt || '',
        closedBy: event.closedBy || '',
        deletedAt: event.deletedAt || '',
        deletedBy: event.deletedBy || '',
        createdAt: event.createdAt || '',
        updatedAt: event.updatedAt || '',
        source: event.source || '',
        sourceId: event.sourceId || '',
        sourceUrl: event.sourceUrl || '',
        sourceImage: event.sourceImage || '',
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '17:00',
        tasks: (event.tasks || []).map(normalizeTask)
    };
}

function normalizeTask(task, index) {
    return {
        id: task.id || createTaskId(task.name || 'task', index),
        name: task.name || '',
        description: task.description || '',
        exp: Number.isFinite(Number(task.exp)) ? Number(task.exp) : 0
    };
}

async function saveUser(user) {
    const users = getUsers();
    const normalizedUser = normalizeUser(user);
    const existingIndex = users.findIndex((item) => item.email === normalizedUser.email);

    // Email acts like the unique user id: logging in again updates the username.
    if (existingIndex >= 0) {
        users[existingIndex] = {
            ...users[existingIndex],
            ...normalizedUser,
            passwordHash: normalizedUser.passwordHash || users[existingIndex].passwordHash || '',
            connectedUsers: normalizedUser.connectedUsers.length
                ? normalizedUser.connectedUsers
                : users[existingIndex].connectedUsers,
            questionnaire: normalizedUser.questionnaire.length
                ? normalizedUser.questionnaire
                : users[existingIndex].questionnaire || []
        };
    } else {
        users.push(normalizedUser);
    }

    await writeStore(STORAGE_KEYS.users, users);
    await writeStore(STORAGE_KEYS.currentUser, findUserInList(users, normalizedUser.email) || normalizedUser);
    await refreshSharedState();
}

function findUserInList(users, email) {
    return users.find((user) => user.email === email);
}

async function saveUsers(users) {
    await writeStore(STORAGE_KEYS.users, users.map(normalizeUser));

    const currentUser = readStore(STORAGE_KEYS.currentUser, null);
    if (currentUser) {
        const updatedCurrentUser = findUserInList(users, normalizeEmail(currentUser.email));
        if (updatedCurrentUser) {
            await writeStore(STORAGE_KEYS.currentUser, normalizeUser(updatedCurrentUser));
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

function connectEventParticipants(eventId, currentParticipantId, targetParticipantId) {
    if (!currentParticipantId || !targetParticipantId || currentParticipantId === targetParticipantId) {
        return { status: 'self' };
    }

    const participants = getEventParticipants();
    const currentIndex = participants.findIndex((participant) => (
        participant.eventId === eventId && participant.id === currentParticipantId
    ));
    const targetIndex = participants.findIndex((participant) => (
        participant.eventId === eventId && participant.id === targetParticipantId
    ));

    if (currentIndex < 0 || targetIndex < 0) {
        return { status: 'missing' };
    }

    const currentParticipant = participants[currentIndex];
    const targetParticipant = participants[targetIndex];

    if (currentParticipant.userEmail === targetParticipant.userEmail) {
        return { status: 'self' };
    }

    const alreadyConnected = currentParticipant.connectedParticipantIds.includes(targetParticipant.id);
    if (alreadyConnected) {
        return { status: 'duplicate', target: targetParticipant };
    }

    participants[currentIndex] = {
        ...currentParticipant,
        eventXp: currentParticipant.eventXp + 10,
        connectedParticipantIds: Array.from(new Set([
            ...currentParticipant.connectedParticipantIds,
            targetParticipant.id
        ]))
    };
    participants[targetIndex] = {
        ...targetParticipant,
        eventXp: targetParticipant.eventXp + 10,
        connectedParticipantIds: Array.from(new Set([
            ...targetParticipant.connectedParticipantIds,
            currentParticipant.id
        ]))
    };

    saveEventParticipants(participants);
    connectUsers(currentParticipant.userEmail, targetParticipant.userEmail);
    return { status: 'connected', target: targetParticipant };
}

function saveEvents(events) {
    writeStore(STORAGE_KEYS.events, events.map(normalizeEvent));
}

function updateEventInStore(eventId, updater) {
    const events = getAllEvents();
    const eventIndex = events.findIndex((event) => event.id === eventId);

    if (eventIndex < 0) {
        return null;
    }

    const updatedEvent = normalizeEvent({
        ...updater(events[eventIndex]),
        updatedAt: new Date().toISOString()
    });
    events[eventIndex] = updatedEvent;
    saveEvents(events);
    return updatedEvent;
}

function updateUserExp(email, expToAdd) {
    if (expToAdd <= 0) {
        return;
    }

    const users = getUsers();
    const userIndex = users.findIndex((user) => user.email === email);
    if (userIndex < 0) {
        return;
    }

    users[userIndex] = {
        ...users[userIndex],
        exp: users[userIndex].exp + expToAdd
    };

    writeStore(STORAGE_KEYS.users, users);

    const currentUser = getCurrentUser();
    if (currentUser?.email === email) {
        writeStore(STORAGE_KEYS.currentUser, users[userIndex]);
    }
}

function updateParticipantEventXp(eventId, userEmail, expToAdd) {
    if (!eventId || expToAdd <= 0) {
        return;
    }

    const participants = getEventParticipants();
    const participantIndex = participants.findIndex((participant) => (
        participant.eventId === eventId && participant.userEmail === userEmail
    ));

    if (participantIndex < 0) {
        return;
    }

    participants[participantIndex] = {
        ...participants[participantIndex],
        eventXp: participants[participantIndex].eventXp + expToAdd
    };
    saveEventParticipants(participants);
}

function getQuestionnaireAttemptKey(targetEmail, responderEmail) {
    return `${normalizeEmail(targetEmail)}::${normalizeEmail(responderEmail)}`;
}

function getQuestionnaireAttempt(targetEmail, responderEmail) {
    return getQuestionnaireAttempts()[getQuestionnaireAttemptKey(targetEmail, responderEmail)] || null;
}

function saveQuestionnaireAttempt(targetEmail, responderEmail, attempt) {
    const attempts = getQuestionnaireAttempts();
    attempts[getQuestionnaireAttemptKey(targetEmail, responderEmail)] = attempt;
    writeStore(STORAGE_KEYS.questionnaireAttempts, attempts);
}

function saveUserQuestionnaire(userEmail, questionnaire) {
    const users = getUsers();
    const userIndex = users.findIndex((item) => item.email === userEmail);
    if (userIndex < 0) {
        return null;
    }

    users[userIndex] = {
        ...users[userIndex],
        questionnaire: normalizeQuestionnaire(questionnaire)
    };
    saveUsers(users);
    const currentUser = getCurrentUser();
    if (currentUser?.email === userEmail) {
        writeLocalStore(STORAGE_KEYS.currentUser, normalizeUser(users[userIndex]));
    }
    return users[userIndex];
}

function gradeQuestionnaire(targetUser, responderEmail, answers, eventId = '') {
    const questionnaire = normalizeQuestionnaire(targetUser?.questionnaire);
    const responder = normalizeEmail(responderEmail);
    if (!targetUser || !responder || questionnaire.length === 0 || getQuestionnaireAttempt(targetUser.email, responder)) {
        return null;
    }

    const correct = questionnaire.reduce((total, question) => (
        normalizeAnswer(answers[question.id]) === normalizeAnswer(question.answer) ? total + 1 : total
    ), 0);
    const xpAwarded = Math.round(50 * (correct / questionnaire.length));
    const attempt = {
        targetEmail: targetUser.email,
        responderEmail: responder,
        correct,
        total: questionnaire.length,
        xpAwarded,
        createdAt: new Date().toISOString()
    };

    saveQuestionnaireAttempt(targetUser.email, responder, attempt);
    updateUserExp(responder, xpAwarded);
    updateParticipantEventXp(eventId, responder, xpAwarded);
    addNotification(responder, `You earned ${xpAwarded} XP from ${targetUser.username}'s questionnaire.`);
    return attempt;
}

function makeLocalDateTime(date, time) {
    return new Date(`${date}T${time || '00:00'}`);
}

function formatEventDateTime(event) {
    return `${event.startDate} ${event.startTime} to ${event.endDate} ${event.endTime}`;
}

function getRewardDay(event) {
    return event.endDate;
}

function getEventRewardTime(event) {
    return new Date(makeLocalDateTime(event.endDate, event.endTime).getTime() + EVENT_REWARD_DELAY_MS);
}

function getApprovedTaskScore(event, userEmail) {
    const completions = getTaskCompletions();

    return event.tasks.reduce((total, task) => {
        const approvedUsers = completions[event.id]?.[task.id]?.approved || [];
        return approvedUsers.includes(userEmail) ? total + task.exp : total;
    }, 0);
}

function getEventScore(event, userEmail) {
    const participant = getEventParticipants().find((item) => (
        item.eventId === event.id && item.userEmail === userEmail
    ));

    return getApprovedTaskScore(event, userEmail) + (participant?.eventXp || 0);
}

function getDailyAccountXpAwarded(rewards, userEmail, day) {
    return Object.values(rewards)
        .filter((reward) => reward.userEmail === userEmail && reward.day === day)
        .reduce((total, reward) => total + reward.accountXpAwarded, 0);
}

function addNotification(userEmail, message) {
    const notifications = getNotifications();
    notifications.unshift({
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        userEmail,
        message,
        createdAt: new Date().toISOString()
    });

    writeStore(STORAGE_KEYS.notifications, notifications.slice(0, 50));
}

function processEventRewards() {
    const now = new Date();
    const events = getEvents();
    const registrations = getRegistrations();
    const rewards = getEventRewards();
    let changedRewards = false;

    events.forEach((event) => {
        if (now < getEventRewardTime(event)) {
            return;
        }

        const registeredEmails = getRegisteredEmails(event.id);
        registeredEmails.forEach((email) => {
            const eventXp = getApprovedTaskScore(event, email);
            if (eventXp <= 0) {
                return;
            }

            const rewardKey = `${event.id}:${email}`;
            const existingReward = rewards[rewardKey];
            const eventXpDelta = eventXp - (existingReward?.eventXp || 0);
            if (eventXpDelta <= 0) {
                return;
            }

            const day = getRewardDay(event);
            const alreadyAwardedToday = getDailyAccountXpAwarded(rewards, email, day);
            const remainingDailyXp = Math.max(DAILY_ACCOUNT_XP_CAP - alreadyAwardedToday, 0);
            const accountXpAwarded = Math.min(eventXpDelta, remainingDailyXp);

            rewards[rewardKey] = {
                eventId: event.id,
                eventName: event.name,
                userEmail: email,
                day,
                eventXp,
                accountXpAwarded: (existingReward?.accountXpAwarded || 0) + accountXpAwarded,
                createdAt: now.toISOString()
            };

            updateUserExp(email, accountXpAwarded);
            addNotification(
                email,
                `You have received ${accountXpAwarded} account XP from ${event.name}. Event leaderboard score: ${eventXp} XP.`
            );
            changedRewards = true;
        });
    });

    if (changedRewards) {
        writeStore(STORAGE_KEYS.eventRewards, rewards);
    }
}

function generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashPassword(password) {
    if (window.crypto?.subtle && window.TextEncoder) {
        const encodedPassword = new TextEncoder().encode(password);
        const digest = await window.crypto.subtle.digest('SHA-256', encodedPassword);
        return Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
    }

    return `local:${password}`;
}

async function ensureAdminAccount() {
    const passwordHash = await hashPassword(ADMIN_ACCOUNT.password);
    const users = getUsers();
    const existingIndex = users.findIndex((user) => user.email === ADMIN_ACCOUNT.email);
    const adminUser = normalizeUser({
        ...(existingIndex >= 0 ? users[existingIndex] : {}),
        username: ADMIN_ACCOUNT.username,
        email: ADMIN_ACCOUNT.email,
        passwordHash,
        exp: existingIndex >= 0 ? users[existingIndex].exp : 0,
        connectedUsers: existingIndex >= 0 ? users[existingIndex].connectedUsers : [],
        isGuest: false
    });

    if (existingIndex >= 0) {
        users[existingIndex] = adminUser;
    } else {
        users.push(adminUser);
    }

    await writeStore(STORAGE_KEYS.users, users);
}

async function startEmailVerification(user) {
    const code = generateVerificationCode();

    writeSession(SESSION_KEYS.pendingSignup, {
        ...user,
        code
    });

    demoCodeBox.textContent = `Sending verification code to ${user.email}...`;
    verificationMessage.textContent = '';
    loginForm.classList.add('hidden');
    verificationForm.classList.remove('hidden');
    document.querySelector('#verificationCodeInput').focus();

    try {
        await sendEmail({
            type: 'verification',
            to: user.email,
            code
        });
        demoCodeBox.textContent = `Verification code sent to ${user.email}.`;
    } catch (error) {
        demoCodeBox.textContent = `Email is not configured yet. Temporary local code for ${user.email}: ${code}`;
        verificationMessage.textContent = error.message;
    }
}

function saveEventParticipants(participants) {
    writeStore(STORAGE_KEYS.eventParticipants, participants.map(normalizeParticipant));
}

function createParticipantId() {
    if (window.crypto?.randomUUID) {
        return `participant-${window.crypto.randomUUID()}`;
    }

    return `participant-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function createGuestInternalId() {
    return `guest-${createParticipantId().replace('participant-', '')}@guest.local`;
}

function getCurrentEventParticipant(eventId) {
    const user = getCurrentUser();
    if (!user) {
        return null;
    }

    return getEventParticipants().find((participant) => (
        participant.eventId === eventId && participant.userEmail === user.email
    )) || null;
}

function getParticipantById(eventId, participantId) {
    return getEventParticipants().find((participant) => (
        participant.eventId === eventId && participant.id === participantId
    )) || null;
}

function ensureEventRegistration(eventId, userEmail) {
    const registrations = getRegistrations();
    const records = normalizeRegistrationRecords(registrations[eventId]);
    const email = normalizeEmail(userEmail);
    const existingIndex = records.findIndex((record) => record.email === email);
    const registration = {
        email,
        status: 'registered',
        updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        if (records[existingIndex].status === 'registered') {
            return;
        }

        records[existingIndex] = registration;
    } else {
        records.push(registration);
    }

    registrations[eventId] = records;
    writeStore(STORAGE_KEYS.registrations, registrations);
}

function joinEventWithCurrentUser(eventId) {
    const user = getCurrentUser();
    if (!user) {
        return null;
    }

    ensureEventRegistration(eventId, user.email);

    const participants = getEventParticipants();
    const existingParticipant = participants.find((participant) => (
        participant.eventId === eventId && participant.userEmail === user.email
    ));

    if (existingParticipant) {
        return existingParticipant;
    }

    const participant = normalizeParticipant({
        id: createParticipantId(),
        eventId,
        userEmail: user.email,
        displayName: user.username,
        role: user.role,
        interests: user.interests,
        goal: user.goal,
        eventXp: 0,
        isGuest: user.isGuest,
        createdAt: new Date().toISOString()
    });

    participants.push(participant);
    saveEventParticipants(participants);
    return participant;
}

function createGuestUser(profile, eventId) {
    const guestEmail = createGuestInternalId();
    const guestUser = normalizeUser({
        username: profile.displayName,
        email: guestEmail,
        exp: 0,
        connectedUsers: [],
        role: profile.role,
        interests: profile.interests,
        goal: profile.goal,
        currentEventId: eventId,
        isGuest: true
    });

    saveUser(guestUser);
    return guestUser;
}

function joinEventAsGuest(eventId, guestProfile) {
    const profile = {
        ...guestProfile,
        interests: Array.isArray(guestProfile.interests)
            ? guestProfile.interests
            : parseInterests(guestProfile.interests)
    };
    const guestUser = createGuestUser(profile, eventId);
    ensureEventRegistration(eventId, guestUser.email);

    const participant = normalizeParticipant({
        id: createParticipantId(),
        eventId,
        userEmail: guestUser.email,
        displayName: profile.displayName,
        role: profile.role,
        interests: profile.interests,
        goal: profile.goal,
        eventXp: 0,
        isGuest: true,
        createdAt: new Date().toISOString()
    });

    const participants = getEventParticipants();
    participants.push(participant);
    saveEventParticipants(participants);
    return participant;
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

function createTaskId(name, index) {
    const slug = String(name)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return `${slug || 'task'}-${index}`;
}

function isRegistered(eventId) {
    const user = getCurrentUser();
    return Boolean(user && getRegisteredEmails(eventId).includes(user.email));
}

function toggleRegistration(eventId) {
    const user = getCurrentUser();
    if (!user) {
        return;
    }

    const event = getEventById(eventId);
    if (event && isEventClosed(event)) {
        return;
    }

    const registrations = getRegistrations();
    const records = normalizeRegistrationRecords(registrations[eventId]);
    const existingIndex = records.findIndex((record) => record.email === user.email);
    const registered = existingIndex >= 0 && records[existingIndex].status === 'registered';
    const nextRecord = {
        email: user.email,
        status: registered ? 'unregistered' : 'registered',
        updatedAt: new Date().toISOString()
    };

    // Clicking the same event again unregisters the current user.
    if (existingIndex >= 0) {
        records[existingIndex] = nextRecord;
    } else {
        records.push(nextRecord);
    }

    registrations[eventId] = records;
    writeStore(STORAGE_KEYS.registrations, registrations);
    renderDashboard();
}

function renderEventCard(event) {
    const registered = isRegistered(event.id);
    const locationText = event.location ? event.location : 'No location yet';
    const isInvitedEvent = activeInvite?.eventId === event.id;
    const closed = isEventClosed(event);

    return `
        <article class="event-card ${isInvitedEvent ? 'invited-event' : ''}" id="event-${escapeHtml(event.id)}">
            <div class="event-meta">
                <span class="pill ${escapeHtml(event.type)}">${escapeHtml(event.type)}</span>
                <span class="pill">${escapeHtml(formatEventDateTime(event))}</span>
                ${isCatalogEvent(event) ? '<span class="pill catalog-source">Catalog</span>' : ''}
                ${closed ? '<span class="pill closed">Closed</span>' : ''}
            </div>
            <h3>${escapeHtml(event.name)}</h3>
            <p>${escapeHtml(event.description)}</p>
            <p>${escapeHtml(locationText)}</p>
            ${event.tasks.length ? `<p>${event.tasks.length} task${event.tasks.length === 1 ? '' : 's'} available</p>` : ''}
            <div class="event-actions">
                <button class="secondary-button" type="button" data-info="${escapeHtml(event.id)}">Info</button>
                <button type="button" class="${registered ? 'registered' : ''}" data-register="${escapeHtml(event.id)}" ${closed ? 'disabled' : ''}>
                    ${closed ? 'Closed' : (registered ? 'Registered' : 'Register')}
                </button>
            </div>
        </article>
    `;
}

function renderEventTile(event) {
    const registered = isRegistered(event.id);
    const closed = isEventClosed(event);
    const imageStyle = event.sourceImage
        ? ` style="background-image: linear-gradient(rgba(15, 23, 42, 0.12), rgba(15, 23, 42, 0.72)), url('${escapeHtml(event.sourceImage)}')"`
        : '';

    return `
        <article class="event-tile" id="event-${escapeHtml(event.id)}"${imageStyle}>
            <div class="event-tile-content">
                <div class="event-meta">
                    <span class="pill ${escapeHtml(event.type)}">${escapeHtml(event.type)}</span>
                    ${isCatalogEvent(event) ? '<span class="pill catalog-source">Catalog</span>' : ''}
                    ${closed ? '<span class="pill closed">Closed</span>' : ''}
                </div>
                <h3>${escapeHtml(event.name)}</h3>
                <p>${escapeHtml(event.location || 'Location to be announced')}</p>
                <p>${escapeHtml(formatEventDateTime(event))}</p>
                <div class="event-actions">
                    <button class="secondary-button" type="button" data-info="${escapeHtml(event.id)}">Info</button>
                    <button type="button" class="${registered ? 'registered' : ''}" data-register="${escapeHtml(event.id)}" ${closed ? 'disabled' : ''}>
                        ${closed ? 'Closed' : (registered ? 'Registered' : 'Register')}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderFeaturedEvent(event) {
    if (!event) {
        return '';
    }

    const registered = isRegistered(event.id);
    const closed = isEventClosed(event);
    const imageStyle = event.sourceImage
        ? ` style="background-image: linear-gradient(90deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.16)), url('${escapeHtml(event.sourceImage)}')"`
        : '';

    return `
        <section class="featured-event"${imageStyle}>
            <div class="featured-event-copy">
                <div class="event-meta">
                    <span class="pill ${escapeHtml(event.type)}">${escapeHtml(event.type)}</span>
                    ${isCatalogEvent(event) ? '<span class="pill catalog-source">Catalog</span>' : ''}
                    ${closed ? '<span class="pill closed">Closed</span>' : ''}
                </div>
                <h2>${escapeHtml(event.name)}</h2>
                <p>${escapeHtml(event.description)}</p>
                <p>${escapeHtml(formatEventDateTime(event))} · ${escapeHtml(event.location || 'Location to be announced')}</p>
                <div class="event-actions">
                    <button type="button" data-register="${escapeHtml(event.id)}" class="${registered ? 'registered' : ''}" ${closed ? 'disabled' : ''}>
                        ${closed ? 'Closed' : (registered ? 'Registered' : 'Register')}
                    </button>
                    <button class="secondary-button" type="button" data-info="${escapeHtml(event.id)}">Info</button>
                </div>
            </div>
        </section>
    `;
}

function renderEventRow(title, events) {
    if (!events.length) {
        return '';
    }

    return `
        <section class="event-row">
            <h3>${escapeHtml(title)}</h3>
            <div class="event-row-track">
                ${events.map(renderEventTile).join('')}
            </div>
        </section>
    `;
}

function renderEventDiscovery(events, user) {
    if (!events.length) {
        return '<p class="empty-state">No events match your search.</p>';
    }

    const searching = Boolean(activeEventSearch || activeSourceFilter !== 'all' || activeFilter !== 'all' || activeFromFilter || activeToFilter);
    if (searching) {
        return `
            ${renderFeaturedEvent(events[0])}
            ${renderEventRow('Search Results', events)}
        `;
    }

    const featured = events.find(isCatalogEvent) || events[0];
    const registeredEvents = user
        ? events.filter((event) => isRegistered(event.id))
        : [];
    const catalogEvents = events.filter(isCatalogEvent);
    const manualEvents = events.filter((event) => !isCatalogEvent(event));
    const upcomingEvents = events.slice(0, 12);

    return `
        ${renderFeaturedEvent(featured)}
        ${renderEventRow('Continue Your Events', registeredEvents)}
        ${renderEventRow('Coming Up Soon', upcomingEvents)}
        ${renderEventRow('Public Catalog', catalogEvents)}
        ${renderEventRow('Organizer Picks', manualEvents)}
    `;
}

function matchesEventSearch(event) {
    const query = activeEventSearch.trim().toLowerCase();
    if (!query) {
        return true;
    }

    return [
        event.name,
        event.description,
        event.location,
        event.source
    ].some((value) => String(value || '').toLowerCase().includes(query));
}

function matchesEventSource(event) {
    if (activeSourceFilter === 'all') {
        return true;
    }

    if (activeSourceFilter === 'catalog') {
        return isCatalogEvent(event);
    }

    return !isCatalogEvent(event);
}

function matchesEventDateRange(event) {
    if (activeFromFilter && event.startDate < activeFromFilter) {
        return false;
    }

    if (activeToFilter && event.startDate > activeToFilter) {
        return false;
    }

    return true;
}

function renderDashboard() {
    processEventRewards();

    const user = getCurrentUser();
    const events = getEvents();
    const users = getUsers();
    const registrations = getRegistrations();
    const registeredEventIds = events.filter((event) => user && getRegisteredEmails(event.id).includes(user.email)).length;
    let visibleEvents = events
        .filter((event) => activeFilter === 'all' || event.type === activeFilter)
        .filter(matchesEventSearch)
        .filter(matchesEventSource)
        .filter(matchesEventDateRange)
        .sort((first, second) => (
            makeLocalDateTime(first.startDate, first.startTime) - makeLocalDateTime(second.startDate, second.startTime)
        ));

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
    userLevel.textContent = String(user ? getLevel(user.exp) : 1);
    eventGrid.innerHTML = `${renderInviteNotice(user)}${renderEventDiscovery(visibleEvents, user)}`;
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
        userQrLink.dataset.connectionLink = qrLink;
    }

    renderConnectFlow(user);
    renderQuestionnaireBuilder(user);
    renderConnections(user);
    renderNotifications(user);
}

function renderQuestionnaireBuilder(user, builder = questionnaireBuilder) {
    if (!builder || !user) {
        return;
    }

    const questions = normalizeQuestionnaire(user.questionnaire);
    builder.innerHTML = `
        <div class="section-heading compact">
            <div>
                <p class="eyebrow">Connection quiz</p>
                <h3 class="compact-title">Your questionnaire</h3>
            </div>
            <span class="task-exp">${questions.length}/7</span>
        </div>
        <p class="helper-text">Add up to 7 short questions. People can answer them after they connect with you for up to 50 XP.</p>
        <div class="questionnaire-list" data-questionnaire-list>
            ${questions.map(renderQuestionnaireEditorRow).join('')}
        </div>
        <div class="button-row">
            <button class="secondary-button" type="button" data-add-question ${questions.length >= 7 ? 'disabled' : ''}>Add question</button>
            <button type="button" data-save-questionnaire>Save quiz</button>
        </div>
        <p class="form-message" data-questionnaire-message></p>
    `;
}

function renderQuestionnaireEditorRow(question = {}) {
    return `
        <div class="questionnaire-row" data-questionnaire-row data-question-id="${escapeAttribute(question.id || createQuestionId())}">
            <label>
                Question
                <input type="text" data-question-text value="${escapeAttribute(question.question || '')}" maxlength="140" placeholder="What is my favorite event topic?">
            </label>
            <label>
                Correct answer
                <input type="text" data-question-answer value="${escapeAttribute(question.answer || '')}" maxlength="80" placeholder="Networking">
            </label>
            <button class="secondary-button" type="button" data-remove-question>Remove</button>
        </div>
    `;
}

function readQuestionnaireBuilderRows(builder = questionnaireBuilder) {
    return Array.from(builder?.querySelectorAll('[data-questionnaire-row]') || [])
        .map((row) => ({
            id: row.dataset.questionId || createQuestionId(),
            question: row.querySelector('[data-question-text]')?.value || '',
            answer: row.querySelector('[data-question-answer]')?.value || ''
        }));
}

function handleQuestionnaireBuilderClick(event, builder = questionnaireBuilder) {
    const message = builder?.querySelector('[data-questionnaire-message]');
    const list = builder?.querySelector('[data-questionnaire-list]');

    if (event.target.closest('[data-add-question]')) {
        const rowCount = builder.querySelectorAll('[data-questionnaire-row]').length;
        if (list && rowCount < 7) {
            list.insertAdjacentHTML('beforeend', renderQuestionnaireEditorRow());
        }
        const addButton = builder.querySelector('[data-add-question]');
        if (addButton) {
            addButton.disabled = builder.querySelectorAll('[data-questionnaire-row]').length >= 7;
        }
        return true;
    }

    const removeButton = event.target.closest('[data-remove-question]');
    if (removeButton) {
        removeButton.closest('[data-questionnaire-row]')?.remove();
        const addButton = builder.querySelector('[data-add-question]');
        if (addButton) {
            addButton.disabled = false;
        }
        return true;
    }

    if (event.target.closest('[data-save-questionnaire]')) {
        const user = getCurrentUser();
        if (!user) {
            return true;
        }

        const savedUser = saveUserQuestionnaire(user.email, readQuestionnaireBuilderRows(builder));
        if (message) {
            const count = savedUser?.questionnaire.length || 0;
            message.textContent = `Saved ${count} question${count === 1 ? '' : 's'}.`;
            message.classList.add('success-message');
        }
        renderQuestionnaireBuilder(getCurrentUser(), builder);
        return true;
    }

    return false;
}

function renderConnectionQuestionnaire(targetUser, responderUser, options = {}) {
    const questions = normalizeQuestionnaire(targetUser?.questionnaire);
    if (!targetUser || !responderUser || questions.length === 0) {
        return '';
    }

    const attempt = getQuestionnaireAttempt(targetUser.email, responderUser.email);
    if (attempt) {
        return `
            <div class="questionnaire-quiz">
                <strong>Questionnaire complete</strong>
                <p class="helper-text">You got ${attempt.correct}/${attempt.total} correct and earned ${attempt.xpAwarded} XP.</p>
            </div>
        `;
    }

    if (!options.canAnswer) {
        return '<p class="helper-text">Connect first to unlock this person\'s questionnaire.</p>';
    }

    return `
        <form class="questionnaire-quiz" data-questionnaire-form="${escapeAttribute(targetUser.email)}" data-event-id="${escapeAttribute(options.eventId || '')}">
            <strong>Answer ${escapeHtml(targetUser.username)}'s questionnaire for up to 50 XP</strong>
            ${questions.map((question) => `
                <label>
                    ${escapeHtml(question.question)}
                    <input type="text" name="${escapeAttribute(question.id)}" autocomplete="off" required>
                </label>
            `).join('')}
            <button type="submit">Submit answers</button>
            <p class="form-message" data-questionnaire-result></p>
        </form>
    `;
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
        ${renderConnectionQuestionnaire(targetUser, user, { canAnswer: isConnected })}
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
                <span>Level ${escapeHtml(getLevel(connectedUser.exp || 0))}</span>
            </li>
        `).join('')
        : '<li class="empty-state">No connected users yet.</li>';
}

async function copyConnectionLink() {
    if (!userQrLink?.dataset.connectionLink) {
        return;
    }

    try {
        await navigator.clipboard.writeText(userQrLink.dataset.connectionLink);
        copyQrLinkButton.textContent = 'Copied';
    } catch {
        copyQrLinkButton.textContent = 'Copy failed';
    }

    setTimeout(() => {
        copyQrLinkButton.textContent = 'Copy connection link';
    }, 1800);
}

async function copyCreatedEventLink() {
    if (!createdEventLinkInput?.value || !copyCreatedEventLinkButton) {
        return;
    }

    try {
        await navigator.clipboard.writeText(createdEventLinkInput.value);
        copyCreatedEventLinkButton.textContent = 'Copied';
    } catch {
        createdEventLinkInput.select();
        document.execCommand('copy');
        copyCreatedEventLinkButton.textContent = 'Copied';
    }

    setTimeout(() => {
        copyCreatedEventLinkButton.textContent = 'Copy event link';
    }, 1800);
}

function renderNotifications(user) {
    if (!notificationList) {
        return;
    }

    const notifications = getNotifications()
        .filter((notification) => notification.userEmail === user.email)
        .slice(0, 5);

    notificationList.innerHTML = notifications.length
        ? notifications.map((notification) => `
            <li>
                <strong>${escapeHtml(notification.message)}</strong>
                <span>${escapeHtml(new Date(notification.createdAt).toLocaleString())}</span>
            </li>
        `).join('')
        : '<li class="empty-state">No notifications yet.</li>';
}

function isEventManager(event, user) {
    return Boolean(user && (isAdminUser(user) || event.organizerEmail === user.email || event.managerEmails.includes(user.email)));
}

function isAdminUser(user) {
    return user?.email === ADMIN_ACCOUNT.email;
}

function canEditEvent(event, user) {
    return Boolean(user && (isAdminUser(user) || event.organizerEmail === user.email));
}

function canDeleteEvent(event, user) {
    return canEditEvent(event, user);
}

function getTaskStatus(eventId, taskId, userEmail) {
    const completions = getTaskCompletions();
    const taskCompletion = completions[eventId]?.[taskId];

    if (taskCompletion?.approved?.includes(userEmail)) {
        return 'approved';
    }

    if (taskCompletion?.pending?.includes(userEmail)) {
        return 'pending';
    }

    return 'open';
}

function renderTaskList(event, user) {
    const manager = isEventManager(event, user);
    const taskItems = event.tasks.map((task) => {
        const status = user ? getTaskStatus(event.id, task.id, user.email) : 'open';
        const action = !manager && user
            ? renderTaskAction(event.id, task, status, isRegistered(event.id))
            : '';

        return `
        <li>
            <strong>${escapeHtml(task.name)}</strong>
            <span>${escapeHtml(task.description)}</span>
            <span class="task-exp">${escapeHtml(task.exp)} XP</span>
            ${status !== 'open' ? `<span class="task-status">${escapeHtml(status)}</span>` : ''}
            ${action}
        </li>
    `;
    }).join('');

    return taskItems ? `<ul class="task-list">${taskItems}</ul>` : '<p>No tasks added yet.</p>';
}

function renderTaskAction(eventId, task, status, registered) {
    const event = getEventById(eventId);
    if (event && isEventClosed(event)) {
        return '<span class="task-status">Event closed</span>';
    }

    if (status === 'approved') {
        return '<span class="task-status">XP awarded</span>';
    }

    if (status === 'pending') {
        return '<span class="task-status">Waiting for manager approval</span>';
    }

    if (!registered) {
        return '<span class="task-status">Register to submit this task</span>';
    }

    return `<button class="secondary-button" type="button" data-complete-task="${escapeHtml(eventId)}" data-task-id="${escapeHtml(task.id)}">Mark completed</button>`;
}

function renderInviteLinks(event) {
    const publicLink = makeEventGameLink(event.id);
    const inviteLinks = event.inviteEmails.map((email) => {
        const link = makeInviteLink(event.id, email);
        return `
            <li>
                <strong>${escapeHtml(email)}</strong>
                <a href="${escapeHtml(link)}">${escapeHtml(link)}</a>
            </li>
        `;
    }).join('');

    return `
        <ul class="invite-list">
            <li>
                <strong>Public event game link</strong>
                <a href="${escapeHtml(publicLink)}">${escapeHtml(publicLink)}</a>
            </li>
            ${inviteLinks}
        </ul>
        ${inviteLinks ? '' : '<p>No invite emails added.</p>'}
    `;
}

async function sendEventInvites(event) {
    const inviteEmails = event.inviteEmails || [];
    if (inviteEmails.length === 0) {
        return { sent: 0, failed: 0 };
    }

    const results = await Promise.allSettled(inviteEmails.map((email) => sendEmail({
        type: 'invite',
        to: email,
        eventName: event.name,
        inviteLink: makeInviteLink(event.id, email)
    })));

    return {
        sent: results.filter((result) => result.status === 'fulfilled').length,
        failed: results.filter((result) => result.status === 'rejected').length
    };
}

function normalizeParticipant(participant) {
    return {
        id: participant.id || createParticipantId(),
        eventId: participant.eventId || '',
        userEmail: participant.userEmail ? normalizeEmail(participant.userEmail) : '',
        displayName: participant.displayName || participant.username || 'Guest',
        role: participant.role || '',
        interests: Array.isArray(participant.interests)
            ? participant.interests
            : parseInterests(participant.interests || ''),
        goal: participant.goal || '',
        eventXp: Number.isFinite(Number(participant.eventXp)) ? Number(participant.eventXp) : 0,
        isGuest: Boolean(participant.isGuest),
        connectedParticipantIds: Array.isArray(participant.connectedParticipantIds)
            ? participant.connectedParticipantIds.filter(Boolean)
            : [],
        createdAt: participant.createdAt || new Date().toISOString()
    };
}

function renderManagers(event) {
    const managerItems = event.managerEmails.map((email) => `<li>${escapeHtml(email)}</li>`).join('');
    const closed = isEventClosed(event);

    return `
        <ul class="manager-list">
            <li>${escapeHtml(event.organizerEmail || 'Starter event owner')}</li>
            ${managerItems}
        </ul>
        <form class="inline-form" data-manager-form="${escapeHtml(event.id)}">
            <label>
                Add event manager
                <input type="email" name="managerEmail" placeholder="manager@example.com" required>
            </label>
            <button type="submit">Add manager</button>
        </form>
        <div class="event-close-box">
            <p>${closed ? `Closed ${escapeHtml(new Date(event.closedAt).toLocaleString())}` : 'Close this event when the game is finished.'}</p>
            <button class="secondary-button" type="button" data-close-event="${escapeHtml(event.id)}" ${closed ? 'disabled' : ''}>
                ${closed ? 'Event closed' : 'Close event'}
            </button>
        </div>
    `;
}

function renderEditEventForm(event) {
    return `
        <form class="event-edit-form" data-edit-event="${escapeHtml(event.id)}">
            <label>
                Event name
                <input type="text" name="name" value="${escapeHtml(event.name)}" required>
            </label>
            <label>
                Description
                <textarea name="description" rows="4" required>${escapeHtml(event.description)}</textarea>
            </label>
            <div class="two-column">
                <label>
                    Start date
                    <input type="date" name="startDate" value="${escapeHtml(event.startDate)}" required>
                </label>
                <label>
                    Start time
                    <input type="time" name="startTime" value="${escapeHtml(event.startTime)}" required>
                </label>
            </div>
            <div class="two-column">
                <label>
                    End date
                    <input type="date" name="endDate" value="${escapeHtml(event.endDate)}" required>
                </label>
                <label>
                    End time
                    <input type="time" name="endTime" value="${escapeHtml(event.endTime)}" required>
                </label>
            </div>
            <label>
                Location
                <input type="text" name="location" value="${escapeHtml(event.location || '')}">
            </label>
            <label>
                Type
                <select name="type" required>
                    <option value="professional" ${event.type === 'professional' ? 'selected' : ''}>Professional</option>
                    <option value="leisure" ${event.type === 'leisure' ? 'selected' : ''}>Leisure</option>
                </select>
            </label>
            <label>
                Invite emails
                <textarea name="inviteEmails" rows="3">${escapeHtml((event.inviteEmails || []).join(', '))}</textarea>
            </label>
            <button type="submit">Save changes</button>
        </form>
    `;
}

function renderPendingApprovals(event) {
    const completions = getTaskCompletions();
    const users = getUsers();
    const approvalItems = event.tasks.flatMap((task) => {
        const pending = completions[event.id]?.[task.id]?.pending || [];
        return pending.map((email) => {
            const user = users.find((item) => item.email === email);
            const label = user ? `${user.username} <${email}>` : email;

            return `
                <li>
                    <strong>${escapeHtml(task.name)}</strong>
                    <span>${escapeHtml(label)}</span>
                    <span class="task-exp">${escapeHtml(task.exp)} XP</span>
                    <button type="button" data-approve-task="${escapeHtml(event.id)}" data-task-id="${escapeHtml(task.id)}" data-user-email="${escapeHtml(email)}">Approve</button>
                </li>
            `;
        });
    }).join('');

    return approvalItems ? `<ul class="task-list">${approvalItems}</ul>` : '<p>No task completions waiting for approval.</p>';
}

function renderLeaderboard(event) {
    const registeredEmails = getRegisteredEmails(event.id);
    const participants = getEventParticipants().filter((participant) => participant.eventId === event.id);
    const users = getUsers()
        .filter((user) => registeredEmails.includes(user.email))
        .map((user) => ({
            ...user,
            participant: participants.find((participant) => participant.userEmail === user.email),
            eventXp: getEventScore(event, user.email)
        }))
        .sort((first, second) => second.eventXp - first.eventXp || first.username.localeCompare(second.username));

    const leaderboardItems = users.map((user, index) => `
        <li>
            <span class="leaderboard-rank">${index + 1}</span>
            <strong>${escapeHtml(user.participant?.displayName || user.username)}</strong>
            <span>${escapeHtml(user.isGuest ? 'Guest player' : user.email)}</span>
            <span>Level ${escapeHtml(getLevel(user.exp))}</span>
            <span class="task-exp">${escapeHtml(user.eventXp)} event XP</span>
        </li>
    `).join('');

    return leaderboardItems
        ? `<ol class="leaderboard-list">${leaderboardItems}</ol>`
        : '<p>No attendees registered yet.</p>';
}

function isEventFinished(event) {
    return new Date() > makeLocalDateTime(event.endDate, event.endTime);
}

function isEventClosed(event) {
    return Boolean(event.closedAt);
}

function showEventLanding(event) {
    if (!eventLandingView) {
        return;
    }

    loginView?.classList.add('hidden');
    dashboardView?.classList.add('hidden');
    eventGameView?.classList.add('hidden');
    eventLandingView.classList.remove('hidden');
    guestJoinForm?.classList.add('hidden');

    const locationText = event.location ? event.location : 'Location to be announced';
    const connectTarget = getConnectTargetFromUrl();
    const closed = isEventClosed(event);
    eventLandingTitle.textContent = event.name;
    eventLandingDescription.textContent = event.description || '';
    eventLandingMeta.innerHTML = `
        <span class="pill ${escapeHtml(event.type)}">${escapeHtml(event.type)}</span>
        <span class="pill">${escapeHtml(formatEventDateTime(event))}</span>
        <span class="pill">${escapeHtml(locationText)}</span>
        ${closed ? '<span class="pill closed">Closed</span>' : ''}
    `;
    eventLandingMessage.textContent = closed
        ? 'This event has been closed by the organizer.'
        : connectTarget
        ? 'Join this event first, then you can connect with the person from the QR code.'
        : '';
    if (joinEventButton) {
        joinEventButton.disabled = closed;
        joinEventButton.textContent = closed ? 'EVENT CLOSED' : 'JOIN EVENT';
    }
}

function renderEventConnectFlow(event, participant) {
    if (!gameConnectFlow) {
        return;
    }

    if (isEventClosed(event)) {
        gameConnectFlow.classList.remove('hidden');
        gameConnectFlow.innerHTML = `
            <p class="eyebrow">Event closed</p>
            <h3>This event is no longer accepting new connections</h3>
            <p class="helper-text">You can still see your XP, connections, and leaderboard.</p>
        `;
        return;
    }

    const targetId = getConnectTargetFromUrl();
    if (!targetId) {
        gameConnectFlow.classList.add('hidden');
        gameConnectFlow.innerHTML = '';
        return;
    }

    const targetParticipant = getParticipantById(event.id, targetId);
    if (!targetParticipant) {
        gameConnectFlow.classList.remove('hidden');
        gameConnectFlow.innerHTML = '<p class="form-message">This connection QR is not valid for this event.</p>';
        return;
    }

    const isSelf = targetParticipant.id === participant.id || targetParticipant.userEmail === participant.userEmail;
    const alreadyConnected = participant.connectedParticipantIds.includes(targetParticipant.id);
    const user = getCurrentUser();
    const targetUser = findUserByEmail(targetParticipant.userEmail);
    gameConnectFlow.classList.remove('hidden');
    gameConnectFlow.innerHTML = `
        <p class="eyebrow">QR scanned</p>
        <h3>${isSelf ? 'This is your own QR' : `Connect with ${escapeHtml(targetParticipant.displayName)}`}</h3>
        <p class="helper-text">${escapeHtml(targetParticipant.role || 'Event participant')}</p>
        ${isSelf
            ? '<p class="helper-text">Share your QR with someone else to make a new connection.</p>'
            : `<button type="button" data-event-connect="${escapeHtml(targetParticipant.id)}" ${alreadyConnected ? 'disabled' : ''}>${alreadyConnected ? 'Connected' : 'Connect and earn XP'}</button>`
        }
        ${!isSelf && targetUser && user ? renderConnectionQuestionnaire(targetUser, user, {
            canAnswer: alreadyConnected,
            eventId: event.id
        }) : ''}
    `;
}

function renderEventConnections(participant) {
    if (!gameConnectionList) {
        return;
    }

    const participants = getEventParticipants();
    const connections = participant.connectedParticipantIds
        .map((id) => participants.find((item) => item.id === id))
        .filter(Boolean)
        .sort((first, second) => first.displayName.localeCompare(second.displayName));

    gameConnectionList.innerHTML = connections.length
        ? connections.map((connectedParticipant) => `
            <li>
                <strong>${escapeHtml(connectedParticipant.displayName)}</strong>
                <span>${escapeHtml(connectedParticipant.role || 'Event participant')}</span>
                <span>${escapeHtml(connectedParticipant.interests.join(', ') || 'No interests listed')}</span>
            </li>
        `).join('')
        : '<li class="empty-state">No event connections yet.</li>';
}

function renderEventGameTasks(event, participant) {
    if (!gameTaskList) {
        return;
    }

    const user = getCurrentUser();
    gameTaskList.innerHTML = renderTaskList(event, user);

    if (!participant || !isRegistered(event.id)) {
        gameTaskList.insertAdjacentHTML('beforeend', '<p class="helper-text">Join the event to submit tasks.</p>');
    }
}

function renderSaveXpPrompt(event, participant) {
    if (!saveXpPrompt || !saveXpText) {
        return;
    }

    const hiddenByChoice = readSession(`${SESSION_KEYS.pendingGuestXpSave}:later:${participant.id}`, false);
    const eventScore = getEventScore(event, participant.userEmail);
    if (!participant.isGuest || eventScore <= 0 || !isEventFinished(event) || hiddenByChoice) {
        saveXpPrompt.classList.add('hidden');
        return;
    }

    saveXpPrompt.classList.remove('hidden');
    saveXpText.textContent = `You earned ${eventScore} XP at this event. Create your Event Passport to carry this XP to your next event.`;
}

function renderEventGameDashboard(event, participant) {
    if (!eventGameView) {
        return;
    }

    processEventRewards();

    loginView?.classList.add('hidden');
    dashboardView?.classList.add('hidden');
    eventLandingView?.classList.add('hidden');
    eventGameView.classList.remove('hidden');

    const user = getCurrentUser();
    const freshParticipant = getCurrentEventParticipant(event.id) || participant;
    const qrLink = makeParticipantQrLink(event.id, freshParticipant.id);

    gameEventTitle.textContent = event.name;
    gameUserLabel.textContent = `${freshParticipant.displayName} ${freshParticipant.role ? `- ${freshParticipant.role}` : ''}`;
    gameUserXp.textContent = String(getEventScore(event, freshParticipant.userEmail));
    gameUserLevel.textContent = String(getLevel(getEventScore(event, freshParticipant.userEmail)));
    gameConnectionCount.textContent = String(freshParticipant.connectedParticipantIds.length);

    if (gameQrImage && gameQrLink) {
        gameQrImage.src = makeQrImageUrl(qrLink);
        gameQrLink.href = qrLink;
        gameQrLink.textContent = qrLink;
    }

    if (scanGameQrButton) {
        scanGameQrButton.disabled = isEventClosed(event);
        scanGameQrButton.textContent = isEventClosed(event) ? 'Event closed' : 'Scan QR Code';
    }

    if (user?.isGuest && user.email !== freshParticipant.userEmail) {
        writeStore(STORAGE_KEYS.currentUser, findUserByEmail(freshParticipant.userEmail) || user);
    }

    renderEventConnectFlow(event, freshParticipant);
    renderEventGameTasks(event, freshParticipant);
    renderEventConnections(freshParticipant);
    if (gameLeaderboard) {
        gameLeaderboard.innerHTML = renderLeaderboard(event);
    }
    renderQuestionnaireBuilder(user, gameQuestionnaireBuilder);
    renderSaveXpPrompt(event, freshParticipant);
}

function saveGuestProgressToAccount(realEmail) {
    const pending = readSession(SESSION_KEYS.pendingGuestXpSave, null);
    if (!pending?.guestEmail || !pending?.eventId) {
        return;
    }

    const realUser = findUserByEmail(realEmail);
    const guestUser = findUserByEmail(pending.guestEmail);
    if (!realUser || !guestUser) {
        return;
    }

    const event = getEventById(pending.eventId);
    const guestEventScore = event ? getEventScore(event, pending.guestEmail) : guestUser.exp;
    const participants = getEventParticipants().map((participant) => (
        participant.userEmail === pending.guestEmail
            ? { ...participant, userEmail: realEmail, isGuest: false, displayName: realUser.username }
            : participant
    ));
    saveEventParticipants(participants);

    const registrations = getRegistrations();
    Object.keys(registrations).forEach((eventId) => {
        registrations[eventId] = normalizeRegistrationRecords(registrations[eventId]).map((record) => (
            record.email === pending.guestEmail
                ? { ...record, email: realEmail, updatedAt: new Date().toISOString() }
                : record
        ));
    });
    writeStore(STORAGE_KEYS.registrations, registrations);

    const completions = getTaskCompletions();
    Object.values(completions).forEach((eventCompletions) => {
        Object.values(eventCompletions).forEach((taskCompletion) => {
            taskCompletion.pending = Array.from(new Set((taskCompletion.pending || []).map((email) => (
                email === pending.guestEmail ? realEmail : email
            ))));
            taskCompletion.approved = Array.from(new Set((taskCompletion.approved || []).map((email) => (
                email === pending.guestEmail ? realEmail : email
            ))));
        });
    });
    writeStore(STORAGE_KEYS.taskCompletions, completions);

    const attempts = getQuestionnaireAttempts();
    const migratedAttempts = {};
    Object.entries(attempts).forEach(([key, attempt]) => {
        const targetEmail = attempt.targetEmail === pending.guestEmail ? realEmail : attempt.targetEmail;
        const responderEmail = attempt.responderEmail === pending.guestEmail ? realEmail : attempt.responderEmail;
        migratedAttempts[
            targetEmail && responderEmail ? getQuestionnaireAttemptKey(targetEmail, responderEmail) : key
        ] = {
            ...attempt,
            targetEmail,
            responderEmail
        };
    });
    writeStore(STORAGE_KEYS.questionnaireAttempts, migratedAttempts);

    const users = getUsers()
        .filter((user) => user.email !== pending.guestEmail)
        .map((user) => {
            const connectedUsers = Array.from(new Set(user.connectedUsers.map((email) => (
                email === pending.guestEmail ? realEmail : email
            )))).filter((email) => email !== user.email);

            if (user.email === realEmail) {
                return {
                    ...user,
                    exp: Math.max(user.exp, guestUser.exp, guestEventScore),
                    connectedUsers,
                    isGuest: false
                };
            }

            return { ...user, connectedUsers };
        });

    saveUsers(users);
    sessionStorage.removeItem(SESSION_KEYS.pendingGuestXpSave);
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
    const manager = isEventManager(event, user);
    const editable = canEditEvent(event, user);
    const deletable = canDeleteEvent(event, user);
    const closedText = isEventClosed(event)
        ? `Closed ${new Date(event.closedAt).toLocaleString()}`
        : 'Open';
    const managerSections = manager
        ? `
            <section class="dialog-section">
                <h3>Managers</h3>
                ${renderManagers(event)}
            </section>
            <section class="dialog-section">
                <h3>Invite links</h3>
                ${renderInviteLinks(event)}
            </section>
            <section class="dialog-section">
                <h3>Pending task approvals</h3>
                ${renderPendingApprovals(event)}
            </section>
        `
        : '';
    const ownerSections = editable
        ? `
            <section class="dialog-section">
                <h3>Edit event</h3>
                ${renderEditEventForm(event)}
            </section>
        `
        : '';
    const deleteSection = deletable
        ? `
            <section class="dialog-section danger-section">
                <h3>Delete event</h3>
                <p>This removes the event from the global catalog for everyone.</p>
                <button class="danger-button" type="button" data-delete-event="${escapeHtml(event.id)}">Delete event</button>
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
            <p>${escapeHtml(formatEventDateTime(event))}</p>
            <p>Account XP notifications unlock around ${escapeHtml(getEventRewardTime(event).toLocaleString())}</p>
            ${user ? `<p>Your account level: ${escapeHtml(getLevel(user.exp))} (${escapeHtml(user.exp)} / ${escapeHtml(getNextLevelExp(user.exp))} XP)</p>` : ''}
            <p>${escapeHtml(locationText)}</p>
            <p>Organizer: ${escapeHtml(organizerText)}</p>
            <p>Status: ${escapeHtml(closedText)}</p>
        </section>
        <section class="dialog-section">
            <h3>Leaderboard</h3>
            ${renderLeaderboard(event)}
        </section>
        <section class="dialog-section">
            <h3>Tasks</h3>
            ${renderTaskList(event, user)}
        </section>
        ${ownerSections}
        ${managerSections}
        ${deleteSection}
    `;
    if (!eventDialog.open) {
        eventDialog.showModal();
    }
}

function addEventManager(eventId, rawEmail) {
    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) {
        return;
    }

    const events = getEvents();
    const eventIndex = events.findIndex((event) => event.id === eventId);
    if (eventIndex < 0) {
        return;
    }

    const event = events[eventIndex];
    const user = getCurrentUser();
    if (!isEventManager(event, user)) {
        return;
    }

    if (event.organizerEmail === email || event.managerEmails.includes(email)) {
        return;
    }

    events[eventIndex] = {
        ...event,
        managerEmails: [...event.managerEmails, email]
    };

    saveEvents(events);
    openEventDialog(eventId);
    renderDashboard();
}

function editEvent(eventId, form) {
    const event = getEventById(eventId);
    const user = getCurrentUser();

    if (!event || !canEditEvent(event, user)) {
        return;
    }

    const inviteEmails = parseInviteEmails(form.elements.inviteEmails.value);
    const updatedEvent = {
        ...event,
        name: form.elements.name.value.trim(),
        description: form.elements.description.value.trim(),
        startDate: form.elements.startDate.value,
        startTime: form.elements.startTime.value,
        endDate: form.elements.endDate.value,
        endTime: form.elements.endTime.value,
        location: form.elements.location.value.trim(),
        type: form.elements.type.value,
        inviteEmails
    };

    if (!updatedEvent.name || !updatedEvent.description) {
        return;
    }

    if (makeLocalDateTime(updatedEvent.endDate, updatedEvent.endTime) <= makeLocalDateTime(updatedEvent.startDate, updatedEvent.startTime)) {
        return;
    }

    updateEventInStore(eventId, () => updatedEvent);
    openEventDialog(eventId);
    renderDashboard();
}

function deleteEvent(eventId) {
    const event = getEventById(eventId);
    const user = getCurrentUser();

    if (!event || !canDeleteEvent(event, user)) {
        return;
    }

    const confirmed = window.confirm(`Delete ${event.name}? This removes it for everyone.`);
    if (!confirmed) {
        return;
    }

    updateEventInStore(eventId, (currentEvent) => ({
        ...currentEvent,
        deletedAt: new Date().toISOString(),
        deletedBy: user.email
    }));

    if (eventDialog?.open) {
        eventDialog.close();
    }

    renderDashboard();
}

function closeEvent(eventId) {
    const events = getEvents();
    const eventIndex = events.findIndex((event) => event.id === eventId);
    const user = getCurrentUser();

    if (eventIndex < 0 || !isEventManager(events[eventIndex], user) || isEventClosed(events[eventIndex])) {
        return;
    }

    events[eventIndex] = {
        ...events[eventIndex],
        closedAt: new Date().toISOString(),
        closedBy: user.email
    };

    saveEvents(events);
    openEventDialog(eventId);
    renderDashboard();
}

function requestTaskCompletion(eventId, taskId) {
    const user = getCurrentUser();
    if (!user) {
        return;
    }

    const event = getEventById(eventId);
    if (event && isEventClosed(event)) {
        return;
    }

    if (!isRegistered(eventId)) {
        return;
    }

    const completions = getTaskCompletions();
    const eventCompletions = completions[eventId] || {};
    const taskCompletion = eventCompletions[taskId] || { pending: [], approved: [] };

    if (!taskCompletion.pending.includes(user.email) && !taskCompletion.approved.includes(user.email)) {
        taskCompletion.pending.push(user.email);
    }

    completions[eventId] = {
        ...eventCompletions,
        [taskId]: taskCompletion
    };

    writeStore(STORAGE_KEYS.taskCompletions, completions);
    if (isEventMode()) {
        const event = getEventById(eventId);
        const participant = getCurrentEventParticipant(eventId);
        if (event && participant) {
            renderEventGameDashboard(event, participant);
        }
        return;
    }

    openEventDialog(eventId);
}

function approveTaskCompletion(eventId, taskId, userEmail) {
    const event = getEvents().find((item) => item.id === eventId);
    const user = getCurrentUser();
    if (!event || !isEventManager(event, user)) {
        return;
    }

    const task = event.tasks.find((item) => item.id === taskId);
    if (!task) {
        return;
    }

    const completions = getTaskCompletions();
    const eventCompletions = completions[eventId] || {};
    const taskCompletion = eventCompletions[taskId] || { pending: [], approved: [] };

    taskCompletion.pending = taskCompletion.pending.filter((email) => email !== userEmail);
    if (!taskCompletion.approved.includes(userEmail)) {
        taskCompletion.approved.push(userEmail);
    }

    completions[eventId] = {
        ...eventCompletions,
        [taskId]: taskCompletion
    };

    writeStore(STORAGE_KEYS.taskCompletions, completions);
    openEventDialog(eventId);
    renderDashboard();
}

function showView() {
    const user = getCurrentUser();
    const pendingSignup = readSession(SESSION_KEYS.pendingSignup, null);
    const eventId = getEventIdFromUrl();

    if (eventId) {
        const event = getEventById(eventId);
        dashboardView?.classList.add('hidden');

        if (!event) {
            loginView?.classList.add('hidden');
            eventGameView?.classList.add('hidden');
            eventLandingView?.classList.remove('hidden');
            if (eventLandingTitle) {
                eventLandingTitle.textContent = 'Event not found';
            }
            if (eventLandingDescription) {
                eventLandingDescription.textContent = 'This event game link does not match a saved event.';
            }
            if (eventLandingMeta) {
                eventLandingMeta.innerHTML = '';
            }
            if (eventLandingMessage) {
                eventLandingMessage.textContent = 'Ask the organizer for a fresh event game link.';
            }
            return;
        }

        if (pendingSignup) {
            eventLandingView?.classList.add('hidden');
            eventGameView?.classList.add('hidden');
            loginView?.classList.remove('hidden');
            loginForm.classList.add('hidden');
            verificationForm.classList.remove('hidden');
            demoCodeBox.textContent = `Local demo email code for ${pendingSignup.email}: ${pendingSignup.code}`;
            return;
        }

        const pendingGuestSave = readSession(SESSION_KEYS.pendingGuestXpSave, null);
        if (user && !user.isGuest && pendingGuestSave?.eventId === eventId) {
            saveGuestProgressToAccount(user.email);
            const mergedParticipant = getCurrentEventParticipant(eventId);
            if (mergedParticipant) {
                renderEventGameDashboard(event, mergedParticipant);
                return;
            }
        }

        const existingParticipant = getCurrentEventParticipant(eventId);
        const shouldJoinWithAccount = user && !user.isGuest && readSession(SESSION_KEYS.pendingAccountEventJoin, '') === eventId;

        if (shouldJoinWithAccount && isEventClosed(event)) {
            sessionStorage.removeItem(SESSION_KEYS.pendingAccountEventJoin);
            showEventLanding(event);
            return;
        }

        if (shouldJoinWithAccount) {
            sessionStorage.removeItem(SESSION_KEYS.pendingAccountEventJoin);
            const participant = joinEventWithCurrentUser(eventId);
            saveGuestProgressToAccount(user.email);
            renderEventGameDashboard(event, getCurrentEventParticipant(eventId) || participant);
            return;
        }

        if (existingParticipant) {
            renderEventGameDashboard(event, existingParticipant);
            return;
        }

        showEventLanding(event);
        return;
    }

    eventLandingView?.classList.add('hidden');
    eventGameView?.classList.add('hidden');

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

if (joinEventButton) {
    joinEventButton.addEventListener('click', () => {
        const event = getEventById(getEventIdFromUrl());
        if (event && isEventClosed(event)) {
            eventLandingMessage.textContent = 'This event has been closed by the organizer.';
            return;
        }

        guestJoinForm?.classList.remove('hidden');
        guestJoinMessage.textContent = '';
        document.querySelector('#guestDisplayNameInput')?.focus();
    });
}

if (eventLoginButton) {
    eventLoginButton.addEventListener('click', () => {
        const eventId = getEventIdFromUrl();
        const user = getCurrentUser();

        if (eventId) {
            writeSession(SESSION_KEYS.pendingAccountEventJoin, eventId);
        }

        if (user && !user.isGuest && eventId) {
            const targetEvent = getEventById(eventId);
            const participant = joinEventWithCurrentUser(eventId);
            sessionStorage.removeItem(SESSION_KEYS.pendingAccountEventJoin);
            saveGuestProgressToAccount(user.email);
            if (targetEvent && participant) {
                renderEventGameDashboard(targetEvent, getCurrentEventParticipant(eventId) || participant);
            }
            return;
        }

        eventLandingView?.classList.add('hidden');
        eventGameView?.classList.add('hidden');
        loginView?.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        verificationForm.classList.add('hidden');
        loginMessage.textContent = 'Log in with your email, then you will join this event.';
        emailInput?.focus();
    });
}

if (guestJoinForm) {
    guestJoinForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await refreshSharedState();

        const eventId = getEventIdFromUrl();
        const targetEvent = getEventById(eventId);
        const displayName = document.querySelector('#guestDisplayNameInput').value.trim();
        const role = document.querySelector('#guestRoleInput').value.trim();
        const interests = document.querySelector('#guestInterestsInput').value;
        const goal = document.querySelector('#guestGoalInput').value.trim();

        if (!targetEvent || !displayName || !role) {
            guestJoinMessage.textContent = 'Add a display name and role to join.';
            return;
        }

        if (isEventClosed(targetEvent)) {
            guestJoinMessage.textContent = 'This event has been closed by the organizer.';
            return;
        }

        const participant = joinEventAsGuest(eventId, {
            displayName,
            role,
            interests,
            goal
        });

        guestJoinForm.reset();
        renderEventGameDashboard(targetEvent, participant);
    });
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const email = normalizeEmail(emailInput.value);
    const password = passwordInput.value;

    if (!email) {
        loginMessage.textContent = 'Please enter your email.';
        return;
    }

    if (password && password.length < 6) {
        loginMessage.textContent = 'Use a password with at least 6 characters.';
        return;
    }

    const passwordHash = password ? await hashPassword(password) : '';
    const existingUser = findUserByEmail(email);
    if (!existingUser) {
        if (!username) {
            loginMessage.textContent = 'Add a display name to create a new account.';
            return;
        }

        await startEmailVerification({ username, email, passwordHash, exp: 0 });
        return;
    }

    if (passwordHash && existingUser.passwordHash && existingUser.passwordHash !== passwordHash) {
        loginMessage.textContent = 'That password does not match this account.';
        return;
    }

    await saveUser({
        ...existingUser,
        username: username || existingUser.username,
        passwordHash: existingUser.passwordHash || passwordHash
    });
    loginForm.reset();
    loginMessage.textContent = '';
    showView();
});

verificationForm.addEventListener('submit', async (event) => {
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
    await saveUser(verifiedUser);
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

eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await refreshSharedState();
    createdEventLinkPanel?.classList.add('hidden');

    const user = getCurrentUser();
    const name = document.querySelector('#eventNameInput').value.trim();
    const description = document.querySelector('#eventDescriptionInput').value.trim();
    const startDate = document.querySelector('#startDateInput').value;
    const startTime = document.querySelector('#startTimeInput').value;
    const endDate = document.querySelector('#endDateInput').value;
    const endTime = document.querySelector('#endTimeInput').value;
    const location = document.querySelector('#locationInput').value.trim();
    const type = document.querySelector('#eventTypeInput').value;
    const inviteEmails = parseInviteEmails(document.querySelector('#inviteEmailsInput').value);

    if (makeLocalDateTime(endDate, endTime) <= makeLocalDateTime(startDate, startTime)) {
        eventMessage.textContent = 'End date and time must be after the start date and time.';
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
    const newEvent = {
        id,
        name,
        description,
        startDate,
        startTime,
        endDate,
        endTime,
        location,
        type,
        inviteEmails,
        organizerEmail: user.email,
        managerEmails: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: draftTasks.map((task) => ({ ...task }))
    };

    events.push(newEvent);
    const eventLink = makeEventGameLink(newEvent.id);

    saveEvents(events);
    eventForm.reset();
    draftTasks = [];
    renderDraftTasks();
    eventMessage.classList.add('success-message');
    eventMessage.textContent = 'Event created.';
    if (createdEventLinkInput) {
        createdEventLinkInput.value = eventLink;
    }
    createdEventLinkPanel?.classList.remove('hidden');
    renderDashboard();

    if (inviteEmails.length) {
        try {
            const inviteResult = await sendEventInvites(newEvent);
            eventMessage.textContent = `Event created. ${inviteResult.sent} invite email${inviteResult.sent === 1 ? '' : 's'} sent.`;

            if (inviteResult.failed > 0) {
                eventMessage.textContent += ` ${inviteResult.failed} failed; invite links are still available in event info.`;
            }
        } catch {
            eventMessage.textContent = 'Event created. Invite emails could not be sent; invite links are still available in event info.';
        }
    }
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

    connectFlow.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-questionnaire-form]');
        if (!form) {
            return;
        }

        event.preventDefault();
        const user = getCurrentUser();
        const targetUser = findUserByEmail(normalizeEmail(form.dataset.questionnaireForm));
        if (!user || !targetUser) {
            return;
        }

        const answers = Object.fromEntries(new FormData(form).entries());
        const attempt = gradeQuestionnaire(targetUser, user.email, answers, form.dataset.eventId || '');
        const result = form.querySelector('[data-questionnaire-result]');
        if (result) {
            result.textContent = attempt
                ? `You got ${attempt.correct}/${attempt.total} correct and earned ${attempt.xpAwarded} XP.`
                : 'You already answered this questionnaire.';
            result.classList.toggle('success-message', Boolean(attempt));
        }
        if (attempt) {
            const updatedUser = findUserByEmail(user.email);
            if (updatedUser) {
                userExp.textContent = String(updatedUser.exp || 0);
                userLevel.textContent = String(getLevel(updatedUser.exp || 0));
            }
            form.querySelector('button[type="submit"]')?.setAttribute('disabled', '');
        }
    });
}

if (questionnaireBuilder) {
    questionnaireBuilder.addEventListener('click', (event) => {
        handleQuestionnaireBuilderClick(event, questionnaireBuilder);
    });
}

if (gameQuestionnaireBuilder) {
    gameQuestionnaireBuilder.addEventListener('click', (event) => {
        handleQuestionnaireBuilderClick(event, gameQuestionnaireBuilder);
    });
}

if (eventGameView) {
    eventGameView.addEventListener('click', async (event) => {
        const connectButton = event.target.closest('[data-event-connect]');
        if (connectButton) {
            await refreshSharedState();
            const eventId = getEventIdFromUrl();
            const targetEvent = getEventById(eventId);
            const participant = getCurrentEventParticipant(eventId);

            if (!targetEvent || !participant) {
                return;
            }

            connectEventParticipants(eventId, participant.id, connectButton.dataset.eventConnect);
            renderEventGameDashboard(targetEvent, getCurrentEventParticipant(eventId) || participant);
            return;
        }

        const completeButton = event.target.closest('[data-complete-task]');
        if (completeButton) {
            await refreshSharedState();
            requestTaskCompletion(completeButton.dataset.completeTask, completeButton.dataset.taskId);
            const targetEvent = getEventById(getEventIdFromUrl());
            const participant = getCurrentEventParticipant(getEventIdFromUrl());
            if (targetEvent && participant) {
                renderEventGameDashboard(targetEvent, participant);
            }
        }
    });

    eventGameView.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-questionnaire-form]');
        if (!form) {
            return;
        }

        event.preventDefault();
        const user = getCurrentUser();
        const targetUser = findUserByEmail(normalizeEmail(form.dataset.questionnaireForm));
        const eventId = form.dataset.eventId || getEventIdFromUrl();
        if (!user || !targetUser) {
            return;
        }

        const answers = Object.fromEntries(new FormData(form).entries());
        const attempt = gradeQuestionnaire(targetUser, user.email, answers, eventId);
        const targetEvent = getEventById(eventId);
        const participant = getCurrentEventParticipant(eventId);
        const result = form.querySelector('[data-questionnaire-result]');
        if (result) {
            result.textContent = attempt
                ? `You got ${attempt.correct}/${attempt.total} correct and earned ${attempt.xpAwarded} XP.`
                : 'You already answered this questionnaire.';
            result.classList.toggle('success-message', Boolean(attempt));
        }
        if (attempt && targetEvent && participant) {
            gameUserXp.textContent = String(getEventScore(targetEvent, participant.userEmail));
            gameUserLevel.textContent = String(getLevel(getEventScore(targetEvent, participant.userEmail)));
            form.querySelector('button[type="submit"]')?.setAttribute('disabled', '');
        }
    });
}

if (copyQrLinkButton) {
    copyQrLinkButton.addEventListener('click', copyConnectionLink);
}

if (copyCreatedEventLinkButton) {
    copyCreatedEventLinkButton.addEventListener('click', copyCreatedEventLink);
}

if (connectionUrlForm) {
    connectionUrlForm.addEventListener('submit', (event) => {
        event.preventDefault();
        openPastedConnectionUrl(connectionUrlInput.value);
    });
}

if (scanQrButton) {
    scanQrButton.addEventListener('click', startQrScanner);
}

if (scanGameQrButton) {
    scanGameQrButton.addEventListener('click', startEventQrScanner);
}

if (stopQrScanButton) {
    stopQrScanButton.addEventListener('click', () => {
        stopQrScanner();
        setConnectionUrlMessage('');
    });
}

if (stopGameQrScanButton) {
    stopGameQrScanButton.addEventListener('click', () => {
        stopQrScanner();
        setGameQrScanMessage('');
    });
}

if (saveXpButton) {
    saveXpButton.addEventListener('click', () => {
        const eventId = getEventIdFromUrl();
        const participant = getCurrentEventParticipant(eventId);
        if (!participant) {
            return;
        }

        writeSession(SESSION_KEYS.pendingGuestXpSave, {
            eventId,
            guestEmail: participant.userEmail
        });
        localStorage.removeItem(STORAGE_KEYS.currentUser);
        eventGameView?.classList.add('hidden');
        loginView?.classList.remove('hidden');
        loginForm.classList.remove('hidden');
        verificationForm.classList.add('hidden');
        loginMessage.textContent = 'Log in or create an account to save your guest XP into your Event Passport.';
        emailInput?.focus();
    });
}

if (saveXpLaterButton) {
    saveXpLaterButton.addEventListener('click', () => {
        const participant = getCurrentEventParticipant(getEventIdFromUrl());
        if (participant) {
            writeSession(`${SESSION_KEYS.pendingGuestXpSave}:later:${participant.id}`, true);
        }
        saveXpPrompt?.classList.add('hidden');
    });
}

if (eventGameLogoutButton) {
    eventGameLogoutButton.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEYS.currentUser);
        showView();
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
            return;
        }

        const completeButton = event.target.closest('[data-complete-task]');
        if (completeButton) {
            requestTaskCompletion(completeButton.dataset.completeTask, completeButton.dataset.taskId);
            return;
        }

        const approveButton = event.target.closest('[data-approve-task]');
        if (approveButton) {
            approveTaskCompletion(
                approveButton.dataset.approveTask,
                approveButton.dataset.taskId,
                approveButton.dataset.userEmail
            );
            return;
        }

        const closeEventButton = event.target.closest('[data-close-event]');
        if (closeEventButton) {
            closeEvent(closeEventButton.dataset.closeEvent);
            return;
        }

        const deleteEventButton = event.target.closest('[data-delete-event]');
        if (deleteEventButton) {
            deleteEvent(deleteEventButton.dataset.deleteEvent);
        }
    });

    eventDialog.addEventListener('submit', (event) => {
        const editForm = event.target.closest('[data-edit-event]');
        if (editForm) {
            event.preventDefault();
            editEvent(editForm.dataset.editEvent, editForm);
            return;
        }

        const managerForm = event.target.closest('[data-manager-form]');
        if (!managerForm) {
            return;
        }

        event.preventDefault();
        addEventManager(managerForm.dataset.managerForm, managerForm.elements.managerEmail.value);
    });
}

if (eventSearchForm) {
    eventSearchForm.addEventListener('input', () => {
        activeEventSearch = eventSearchInput?.value || '';
        activeFilter = eventTypeFilterInput?.value || 'all';
        activeSourceFilter = eventSourceFilterInput?.value || 'all';
        activeFromFilter = eventFromFilterInput?.value || '';
        activeToFilter = eventToFilterInput?.value || '';
        renderDashboard();
    });

    eventSearchForm.addEventListener('reset', () => {
        setTimeout(() => {
            activeEventSearch = '';
            activeFilter = 'all';
            activeSourceFilter = 'all';
            activeFromFilter = '';
            activeToFilter = '';
            renderDashboard();
        }, 0);
    });
}

if (syncCatalogButton) {
    syncCatalogButton.addEventListener('click', async () => {
        syncCatalogButton.disabled = true;
        await syncCatalogEvents(true);
        syncCatalogButton.disabled = false;
        renderDashboard();
    });
}

logoutButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    showView();
});

// Seed only once so user-created events are not overwritten on refresh.
async function initializeApp() {
    await syncCatalogEvents(false);
    await loadRemoteState();
    await ensureAdminAccount();

    if (!localStorage.getItem(STORAGE_KEYS.events) || getEvents().length === 0) {
        await writeStore(STORAGE_KEYS.events, seedEvents);
    }

    showView();
}

initializeApp();

setInterval(async () => {
    if (getCurrentUser()) {
        await refreshSharedState();
        showView();
    }
}, REMOTE_REFRESH_INTERVAL_MS);
