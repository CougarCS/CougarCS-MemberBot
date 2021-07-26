# Change Log

## Version 0.0.6 - 7/3/2021
- All mongodb queries are now properly asyncronous.
- The `letter` command has been implemented.
- 

## Version 0.0.6 - 6/26/2021
- Onboarding flow will now check if user exists in cache.
- Onboarding flow will now require email.
- Onboarding flow will check email against PSID.
- Onboarding flow will now distinguish between expired and never members.
- Member API integration will attempt to retry before informing of error.
- Member API retry behavior now has a retry limit.
- Member API will now refresh token when retry limit is hit (though still inform error).

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


