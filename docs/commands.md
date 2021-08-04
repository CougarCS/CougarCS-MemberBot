# Commands

**IMPORTANT**: You cannot revoke someone's member credentials via the member bot. Their member credentials can only be revoked at the Member API level. Once that change is made, someone with the `Officer` role must then call the `flush` command, only once on any given CougarCS server. *Please read the section on the `flush` command! It is not to be used lightly.*

## The `claim` command

The `claim` command can be used by anyone to acquire the \`Member\` role.

The `claim` command first checks whether you have the member role, and if so, will do nothing.

If not, the `claim` command then checks whether you are in the member cache, and if so, will immediately grant you the Member role.

If not, the `claim` command will then kick off the on-boarding flow in DMs.

## The `forget` command

The `forget` command can be used by everyone as a standalone command.

> --forget

When used as a standalone command, it will delete the calling user from the cache and remove their Member role.

To get the member role back, the calling user will then have to go through the on-boarding flow again.

The `forget` command can be used with @ mentions by Officers.

> --forget @someMember

When used with @ mentions, the forget command will remove that user from the member cache as well as remove their member role across all CougarCS discord servers.

The `forget` command can be used with *multiple* @ mentions as well.

> --forget @memberOne @memberTwo @memberThree

All three of these users will be removed from the member cache and their member roles will be removed across all CougarCS discord servers.

## The `flush` command

The `flush` command can be used by anyone with the Officer role to remove the \`Member\` role from users whose membership has expired.

**Note:** The `flush` command checks *all users with the \`Member\` role on all CougarCS discord servers against the Member API to ensure that their membership is up-to-date. As such, it should be used sparingly.

**Best Practice:** The `flush` command should be used once, ideally just before the beginning of each semester.

**Best Practice:** The `flush` command should be used in a non-public channel.

## The `whois` command

The `whois` command can be used by anyone with the Officer role to access member information.

The `whois` command must be used in Officer-only channels to prevent exposure of personal information.

The `whois` command can be used with email OR PSID.

> --whois 1224455
> --whois someone@somewhere.com

The `whois` command displays information from the Member API when used with Email.

The `whois` command displays information from the Member API and the Member Cache when used with PSID.

