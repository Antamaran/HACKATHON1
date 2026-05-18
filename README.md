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

