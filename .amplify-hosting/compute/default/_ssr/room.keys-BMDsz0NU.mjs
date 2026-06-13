const roomKeys = {
  all: ["rooms"],
  lists: () => [...roomKeys.all, "list"],
  list: (params) => [...roomKeys.lists(), params],
  details: () => [...roomKeys.all, "detail"],
  detail: (id) => [...roomKeys.details(), id]
};
export {
  roomKeys as r
};
