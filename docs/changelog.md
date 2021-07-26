# Change Log

## Version 0.0.9 - 7/7/2021
- The `whois` command has been implemented.
- The `whois` command will now check for member & officer roles before executing.
- The `whois` command will require a psid.
- Member API will now retry if request returns 403 or 401 response.
- Member API now has a retry limit.
- Member API will now refresh token when attempting to retry.
- Personal note: Everything has gone to shit. API is acting weird.

## Version 0.0.8 - 7/3/2021
- All mongodb queries are now properly asyncronous.
- The `letter` command has been implemented.
- Onboarding flow will no longer attempt to add member to server.
- Onboarding flow will now send an invite link to member.
- Onboarding flow is now stable for all 7 cases.
- Onboarding flow will now qualify its ask.
- Updated bot dialog to be more consistent.


## Version 0.0.6 - 6/26/2021
- Onboarding flow will now check if user exists in cache.
- Onboarding flow will now require email.
- Onboarding flow will check email against PSID.
- Onboarding flow will now distinguish between expired and never members.


## Version 0.0.6 - 6/26/2021
- Onboarding flow now exists.
- Onboarding flow is correctly interfacing with Member API.
- Onboarding flow validates user input before using it.
- The `claim` command now checks if member role exists on server.
- The `flush` command has been started.
- The `flush` command checks if member & officer role exists on server.
- The `flush` command will require that user has both member & officer roles.

## Version 0.0.3 - 6/19/2021
- The `claim` command checks if you're already have role.
- The `claim` command checks if you're already in cache.
- All dialog now exists in `copy` file.
- Server ids and invite links are now configurable.

## Version 0.0.2 - 6/5/2021
- Database has been integrated.
- The `claim` command has been implemented.
- Docs have been started.

## Version 0.0.1 - 6/1/2021
- Initial directory structure built.
- Project configuration complete.
- Rudimentary bot up and running.


