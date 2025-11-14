## Next Steps

1. **Tighten Firestore Security Rules**
   - Restrict reads/writes to authenticated players only.
   - Enforce room ownership for creation and updates.
   - Add server-side validation for player limits.

2. **Improve Lobby Cleanup & Lifecycle**
   - Automatically archive or delete rooms that stay in `waiting` too long.
   - Remove finished games from the public lobby.
   - Provide a manual “close room” action for the host.

3. **Enhance Online Match Resilience**
   - Handle disconnects and reconnections gracefully.
   - Surface clear status/error messages in the UI.
   - Allow players to rejoin an ongoing match after refresh.

4. **Expand Automated Testing**
   - Unit-test `gameLogic` and AI decision helpers.
   - Add integration tests for `useLocalGame` / `useOnlineGame`.
   - Mock Firestore for lobby/join flows.

5. **Deployment Readiness**
   - Run `npm run lint` / `npm run build` and functions build.
   - Add CI workflow for lint/test/build.
   - Deploy to Firebase (`firebase deploy --only hosting,functions`) once checks pass.

6. **Polish & UX Enhancements**
   - Visual cues for opponent actions.
   - In-game chat or quick reactions.
   - Settings for sound, animation speed, etc.

