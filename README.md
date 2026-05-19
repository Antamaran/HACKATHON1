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

The `web` folder contains a website for creating event game links and running a
guest-friendly XP game for one specific event. First-time account signups use
email verification before the account is created. The current frontend stores
app data in the browser using `localStorage`, with Netlify sync when deployed.

Organizers can still log in without an event link to create events, add tasks,
invite emails, add managers, and approve task completions. Each event has a
public game link in its event info panel, such as:

```text
https://starlit-haupia-07c2f5.netlify.app/web/?event=coffee-match
```

Attendees opening an event link see only that event's landing page. They can
join as a guest with a nickname, role, interests, and optional goal, then get a
personal event QR link such as:

```text
https://starlit-haupia-07c2f5.netlify.app/web/?event=coffee-match&connect=PARTICIPANT_ID
```

Scanning another attendee's QR joins the same event first, then allows a
connection. Duplicate/self connections do not award repeat XP.

When creating an event, you can add invitee email addresses. The organizer can
open the event details to see local invite links that open the site directly to
that event so invitees can log in and register. Invite emails are hidden from
non-organizers.

Users have an account XP value, starting at `0 XP`, and an account level. Level 1
starts at `0 XP`, and each `100 XP` adds one level. Event organizers can add tasks
to their events, and each task has a name, description, and XP value. Organizers
can also add other event managers. Attendees can mark tasks as completed, and an
event manager must approve the completion before it counts toward the event
leaderboard.

Events include start/end dates and start/end times. Approved tasks count toward
the event-specific leaderboard immediately, but account XP is awarded about one
hour after the event ends. Account XP from event tasks is capped at `200 XP` per
day, so a user can score `300 XP` on an event leaderboard while only receiving
the daily maximum in their account XP bar. Reward messages appear in the profile
notifications list when the app is opened or refreshed after the reward time.

Each signed-in user also gets a personal QR code in their profile panel. The QR
code opens a connection page with a `Connect with user` button. After connecting,
both users appear in each other's connected users list and receive `10 XP`.
Users can also copy their personal connection URL from the profile panel and send
it directly. Someone else can paste that URL into the profile panel to open the
same connection flow without scanning the QR code.

Run it locally:

```bash
cd web
python -m http.server 8000
```

Then open the organizer/admin app:

```text
http://localhost:8000
```

Or open a specific event game:

```text
http://localhost:8000/?event=coffee-match
```

## Deploy on Netlify

This repo is ready for Netlify. The `netlify.toml` file tells Netlify to publish
the `web` folder as a static site.

Deploy from Git:

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site** > **Import an existing project**.
3. Pick the GitHub repository.
4. Use these settings:

```text
Build command: leave empty
Publish directory: .
```

5. Deploy the site.

The app will work on a Netlify URL such as:

```text
https://your-site-name.netlify.app
```

Invite links and connection links are configured for:

```text
https://starlit-haupia-07c2f5.netlify.app
```

The root page redirects into the app at:

```text
https://starlit-haupia-07c2f5.netlify.app/web/
```

### Email on Netlify

Email sending is handled by the Netlify Function in `netlify/functions/send-email.js`.
It uses Resend, so add these environment variables in Netlify:

```text
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Event Connect <verified@yourdomain.com>
```

In Netlify, go to **Site configuration** > **Environment variables**, add those
values, then redeploy. `EMAIL_FROM` must use a sender/domain verified in Resend.

The app sends:

- signup verification codes
- event invite emails

If email is not configured, signup falls back to showing a temporary local code
so development does not get blocked.

### Public Event Catalog

Organizers can search a public event catalog and import concerts or other live
events into Event Connect. The catalog uses the Ticketmaster Discovery API from
the Netlify Function in `netlify/functions/event-catalog.mjs`.

Add this Netlify environment variable:

```text
TICKETMASTER_API_KEY=your_ticketmaster_discovery_api_key
```

After redeploying, organizers can search by keyword, city, country, and date
range, then click **Create game** to add the result as a normal Event Connect
event with starter tasks.

### Shared Data

Important: event/user data is still stored in each visitor's browser with
`localStorage` for offline/local fallback, and synced through the Netlify Function
in `netlify/functions/data.js` using Netlify Blobs when deployed. For a larger
production app, you may still want a full database such as Supabase, Firebase, or
Neon.

## User database

The C++ app includes a tiny local user database for participants.
It stores each user's name, email, XP, and connected users in `users.db`.

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
The accepted event types are `professional` and `leisure`. Older stored
`profesional` values are normalized by the website for compatibility.

Use it:

```bash
./event_app event-add event-001 "Coffee Match" "Meet someone new over coffee" 2026-06-01 2026-06-01 "Main hall" leisure
./event_app event-add event-002 "Product Workshop" "Build a quick demo together" 2026-06-02 2026-06-03 professional
./event_app event-show event-001
./event_app event-list
./event_app event-count
```

