import { formatDistance, format } from "date-fns";

export function diceRoll(num: number, sides: number) {
  let str = "You rolled ";
  let total = 0;
  for (let i = 0; i <= num; i++) {
    const result = 1 + Math.floor(Math.random() * sides);
    str += result+", ";
    total += result;
  }
  
  return str + "for a total of "+total;;
}

export function normalize(str: string) {
  str = str.replace(/^\s+|\s+$/g, "");
  const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  const to = "aaaaeeeeiiiioooouuuunc------";

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }
  str = str.replace(/[^a-zA-Z0-9 -]/g, "");

  return str;
};

export function getTimeSince(time) {
  const date = new Date(time);
  return formatDistance(date, new Date(), { addSuffix: true });
}

export function getTime(time) {
  return format(new Date(time), 'MM/dd/yyyy')
}

export function formatModelInput(data, player) {
  const aiInput = {
    id: data.author.id,
    name: data.author.name,
    socket: data.author.socket,
    player: player || {},
    rid: data.roomId,
    content: data.message
  };
  
  return JSON.stringify(aiInput);
}

export function formatModelOutput(data) {
  const aiObj = {
    room: data.rid,
    authorId: 4,
    recipient: null,
    message: data.content || data.message,
    type: "chat"
  };
  
  return aiObj;
}







