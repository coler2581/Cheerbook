# Cheerbook (beta)

Design cheer routines on a mat that plays in time with your music. Run practice from a tablet, and give every athlete a live link to their part.

This is the standalone beta of the playbook first built inside Claude. It is a static web app with no build step, using Supabase for accounts, the shared database, live updates and song storage. Hosting is anything that serves static files; we use Vercel.

## What's in the beta

**Coaches**
- **Accounts:** sign in with email and password, or an emailed link. Each program has an owner and invited coaches.
- **Live sync:** everything saves automatically and stays in step on every coach's device.
- **Same editor as before:** mat, count sheet, scoresheet, teams, Athlete view, beat detection, PDF, producer count sheet and video for athletes.
- **Athlete link per team:** Copy, Text it, Email it, Send to team (the phone's share menu) and a QR code. You can make a new link at any time, which shuts the old one off.

**Athletes (no account)**
- **Opening the link:** they pick their name, then see the mat playing with the music, their spot highlighted and every 8-count of their part.
- **Live updates:** an open athlete view picks up the coach's changes within a few seconds.
- **Run-through and offline:** a full-screen run-through, and "Save for offline" so it opens with no signal.

**Per device**
- **Phone:**
  - The app layout.
  - Turn the phone sideways in a routine for the full-screen run-through.
  - Pinch to zoom the mat; double-tap to reset.
  - Tap an athlete, then tap a spot to move them.
  - Long-press an athlete for options.
- **Tablet:** the mat and the counts side by side in landscape, bigger controls, and the 8-count editor opening beside the mat.
- **Computer:**
  - Keyboard shortcuts (press **?**).
  - Right-click an athlete for options.
  - Ctrl + scroll to zoom the mat.
  - Big mat (**B**) and full-screen run-through (**F**).
- **Installable:** "Add to Home Screen" gives the app its own icon and full screen, and it works offline.

## Setup (one time)

1. **Database.** In Supabase, open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and press **Run**. It is safe to run again later.
2. **Sign-in settings.** In Supabase, open **Authentication**:
   - **Sign In / Providers → Email:** keep Email on, and turn **Confirm email off** for the beta. Supabase's built-in email only reaches your own Supabase team members, at 2 emails an hour, so new coaches couldn't confirm otherwise. Password sign-in then works with no email service.
   - **URL Configuration:** set **Site URL** to your Vercel address (e.g. `https://cheerbook.vercel.app`), and add the same address under **Redirect URLs**.
   - **Later:** to send sign-in links and confirmation emails to anyone, add custom SMTP (Authentication → Emails → SMTP Settings). Resend is one option, and it needs a domain you own.
3. **App settings.** `config.js` holds the Supabase Project URL and the publishable (anon) key. Both are safe to be public. **Never** put the `service_role` or secret key in this repository.
4. **Hosting.** In Vercel, import this repository:
   - Framework preset: **Other**.
   - No build command.
   - Output directory: the repository root.
   - Every push to `main` goes live automatically.

## Using it for the first time
1. Open the site, choose **Create an account**, then name your program.
2. **Account → Coaches:** invite other coaches by email. They create an account with that email and land in your playbook.
3. **Bringing routines over from the Claude version:** in Claude, choose **Import / Export → Export all routines**. Here, choose **Account → Import a file**. Songs aren't in that file, so upload each song again in **Setup → Music**.
4. **Teams → your team → Athlete link → Create athlete link**, then send it to the team.

## Files
| File | What it is |
|---|---|
| `index.html` | Page shell, plus the sample routine new programs start with |
| `app.js`, `app.css` | The playbook app (editor, pages, mat, playback, exports) |
| `beta.css` | Beta-only styles: sign-in, tablet layout, run-through, athlete view |
| `platform.js` | Accounts, Supabase sync, file storage, athlete link feed. Without Supabase settings, it runs in "this device only" mode |
| `config.js` | Supabase settings |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installable app and offline support |
| `supabase/schema.sql` | Tables, access rules, athlete-link functions and storage rules |
| `lib/` | supabase-js 2.117.1, qrcode-generator 1.4.4 and mp4-muxer 5.2.2 (bundled, so the app also works offline) |

## How data is protected
- **Coaches:** only coaches in a program can read or change its routines, enforced by row-level security in the database.
- **Athlete links:** the link gives read access to one team's current routines: names, spots, counts, 8-count notes and the song. It never includes coach notes, the skills tracker, scoresheets, saved versions or other teams.
  - Each link is a random token; making a new link turns the old one off.
- **Songs and logos:** stored under random file names in a storage bucket, so athlete links can play the music without an account.
- **Athletes don't have accounts:** the app only stores what the coach enters, normally names, roles and stunt groups.
