import * as tmi from "tmi.js";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseMessage(message: string, emotes: tmi.ChatUserstate["emotes"]) {
  if (!emotes) return message;

  const map: Record<string, string> = {};
  let text = message.trim();

  Object.entries(emotes).forEach(([id, positions]) => {
    const position = positions[0];
    const [start, end] = position.split("-");

    map[id] = message.substring(parseInt(start, 10), parseInt(end, 10) + 1);
  });

  text = text.replace(/(<)/gi, "$1 ");

  Object.entries(map).forEach(([id, emote]) => {
    const regexp = new RegExp(escapeRegExp(emote), "ig");

    text = text.replace(
      regexp,
      `<i style="background-image: url('https://static-cdn.jtvnw.net/emoticons/v1/${id}/3.0')"></i>`,
    );
  });

  return text.trim();
}
