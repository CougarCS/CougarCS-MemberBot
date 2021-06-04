# Commands

**IMPORTANT**: You cannot revoke someone's member credentials via the member bot. Their member credentials can only be revoked at the Member API level. Once that change is made, someone with the `Officer` role must then call the `flush` command, only once on any given CougarCS server. *Please read the section on the `flush` command! It is not to be used lightly.*

## The `claim` command

The `claim` command can be used by anyone to acquire the \`Member\` role.

## The `flush` command

The `flush` command can be used by anyone with the Officer role to remove the \`Member\` role from users whose membership has expired.

**Note:** The `flush` command checks *all users with the \`Member\` role on all CougarCS discord servers* against the Member API to ensure that their membership is up-to-date. As such, it should be used sparingly.

**Best Practice:** The `flush` command should be used once, ideally just before the beginning of each semester, to ensure that the \`Member\` role is assigned accurately.
