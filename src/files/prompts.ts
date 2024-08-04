const prompts = {
  "no-html": "Do not use HTML or icons. Only markdown is allowed.",
  "user-join": "A user, %s, has joined the global lobby room. send a simple welcome greeting. DO NOT CALL TOOLS FOR THIS PROMPT.",
  "user-join-room": "A user, %s, has joined a game room with id of %s. add recipient field equal to %s. the user should be greeted with a D&D style welcome. the user will need a character to continue, and a player should be created if the player field is an empty object. if the user needs to create a character set creation else set creation. DO NOT CALL TOOLS FOR THIS PROMPT.",
};

export default prompts;