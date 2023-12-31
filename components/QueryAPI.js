import BaseAPI from "./BaseAPI";
import { methodType } from "./consts";

export default class QueryAPI extends BaseAPI {
  // Query the path from backend server
  static query(obstacles, robotX, robotY, robotDir, callback) {
    // Construct the content of the request
    // obstacles: the array of obstacles
    // robotX: the x coordinate of the robot
    // robotY: the y coordinate of the robot
    // robotDir: the direction of the robot
    // retrying: whether the robot is retrying

    const content = {
      obstacles,
      robot_x: robotX,
      robot_y: robotY,
      robot_dir: robotDir,
      retrying: false,
    };

    // Send the request to the backend server
    this.JSONRequest("/path", methodType.post, {}, {}, content)
      .then((res) => {
        if (callback) {
          // eslint-disable-next-line n/no-callback-literal
          callback({
            data: res,
            error: null,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        if (callback) {
          // eslint-disable-next-line n/no-callback-literal
          callback({
            data: null,
            error: err,
          });
        }
      });
  }
}
