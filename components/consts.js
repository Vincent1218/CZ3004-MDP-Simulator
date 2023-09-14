export const API = "https://cz3004-flask-d9cf94ef6ff5.herokuapp.com";

// export const API = "http://127.0.0.1:5000";

export const methodType = {
  get: "GET",
  post: "POST",
  put: "PUT",
  delete: "DELETE",
};

export const Direction = {
  NORTH: 0,
  EAST: 2,
  SOUTH: 4,
  WEST: 6,
  SKIP: 8,
};

export const ObDirection = {
  NORTH: 0,
  EAST: 2,
  SOUTH: 4,
  WEST: 6,
  SKIP: 8,
};

export const DirectionToString = {
  0: "Up",
  2: "Right",
  4: "Down",
  6: "Left",
  8: "None",
};
