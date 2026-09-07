export function formatMessage(text, { user, guild }) {
  return text
    .replaceAll('{user}', user.tag)
    .replaceAll('{mention}', `<@${user.id}>`)
    .replaceAll('{server}', guild.name)
    .replaceAll('{count}', guild.memberCount)
    .replaceAll('\\n', '\n');
}