# HACKATHON1
First hackathon with Melchor and K.B

We are going to make a website to make boring events fun !

The idea is simple: in the inviting email, each participant recieves a link.

Then, you get to your Points page where you can see the amount of points you have, your current ranking and your pseudo. (And a QR-code)

You can change your pseudo whenever you want. This is connected to your IP-address (no login required)

To win points, you need to scan the QR-code of other participants to connect to them.

This way, you get to know other exiting people.

At the end, there is a podium with the participants who earned the most points.

Later, we can think of other games to make the event even more fun!

## Local website

The `web` folder contains a local website for logging in with a username and email,
creating events, and registering for events. First-time signups use a local demo
email verification code before the account is created. The website stores data in
your browser using `localStorage`.

When creating an event, you can add invitee email addresses. The event card will
show local invite links that open the site directly to that event so invitees can
log in and register.

Users have an XP value, starting at `0 XP`. Event organizers can add tasks to
their events, and each task has a name, description, and XP value.

Run it locally:

```bash
cd web
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## User database

The C++ app includes a tiny local user database for participants.
It stores each user's name, email, and connected users in `users.db`.

Compile it:

```bash
g++ main.cpp -std=c++17 -o event_app
```

Use it:

```bash
./event_app add "Ada Lovelace" ada@example.com
./event_app add "Grace Hopper" grace@example.com
./event_app connect ada@example.com grace@example.com
./event_app show ada@example.com
./event_app list
./event_app count
```

## Event database

The app also stores events in `events.db`.
Each event has an id, name, description, start date, end date, optional location, and type.
Dates use `YYYY-MM-DD` format.
The accepted event types are `profesional` and `leisure`.

Use it:

```bash
./event_app event-add event-001 "Coffee Match" "Meet someone new over coffee" 2026-06-01 2026-06-01 "Main hall" leisure
./event_app event-add event-002 "Product Workshop" "Build a quick demo together" 2026-06-02 2026-06-03 profesional
./event_app event-show event-001
./event_app event-list
./event_app event-count
```

