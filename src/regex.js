module.exports = {
    spacesRegex: / +/,
    psidRegex: /^\d{7}$/, 
    emailRegex: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    userInputRegex: /^\d{7} +[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    mentionRegex: /^<@!?\d+>$/,
}