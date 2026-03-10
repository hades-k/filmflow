# Household Feature

## Overview
The household feature allows users to link their accounts together to share access to the same movie session database. All members of a household can view, create, edit, and delete sessions that belong to the household.

## How It Works

### Creating a Household
1. Sign in to FilmFlow
2. In the Household section, click "Create Household"
3. Enter a name for your household (e.g., "Smith Family")
4. Click "Create"
5. You'll receive a unique 6-character invite code

### Joining a Household
1. Sign in to FilmFlow
2. Get the invite code from a household member
3. In the Household section, click "Join Household"
4. Enter the invite code
5. Click "Join"

### Leaving a Household
1. In the Household section, click "Leave Household"
2. Confirm the action
3. You'll lose access to shared sessions but keep your personal sessions

## Data Structure

### Collections
- `users`: User profiles with household membership
- `households`: Household information and member lists
- `sessions`: Movie sessions (can be personal or household-shared)

### Session Ownership
- Sessions created before joining a household remain personal
- Sessions created after joining a household are automatically shared with all household members
- All household members can edit/delete any household session

## Security
Firestore security rules ensure:
- Users can only read/write their own profile
- Users can only access households they're members of
- Users can only access sessions they own OR sessions belonging to their household
- Household members must be authenticated to perform any operations

## UI Components

### HouseholdManager Component
Located at `src/components/HouseholdManager.tsx`
- Displays current household information
- Shows household members
- Provides invite code with copy functionality
- Allows creating/joining/leaving households

### Integration in App.tsx
- Household manager appears at the top of the main dashboard
- Sessions automatically filter based on household membership
- New sessions are tagged with the current household ID

## API Functions

### householdService.ts
- `createUserProfile(userId, email, displayName)`: Initialize user profile
- `getUserProfile(userId)`: Get user profile data
- `createHousehold(userId, name)`: Create a new household
- `getHousehold(householdId)`: Get household details
- `joinHouseholdByCode(userId, inviteCode)`: Join household via invite code
- `leaveHousehold(userId, householdId)`: Leave a household
- `getHouseholdMembers(householdId)`: Get list of household members

### sessionService.ts (Updated)
- `getSessions(userId, householdId?)`: Get sessions (personal or household)
- `addSession(userId, sessionData, householdId?)`: Create session with optional household link

## Deployment Notes

After deploying this feature:
1. Deploy updated Firestore rules: `firebase deploy --only firestore:rules`
2. Existing users will need to create or join a household to start sharing
3. Existing sessions remain personal until users join households
4. New sessions created after joining a household are automatically shared

## Future Enhancements
- Household admin roles
- Ability to transfer session ownership
- Household settings and preferences
- Activity feed showing who added/edited sessions
- Household statistics and insights
