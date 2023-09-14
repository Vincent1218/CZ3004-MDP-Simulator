import React, { useState, useEffect } from "react";
import QueryAPI from "./QueryAPI";
import { Direction, DirectionToString, ObDirection } from "./consts";
import { Button, Table, notification, Pagination } from "antd";

const transformCoord = (x, y) => {
  // Change the coordinate system from (0, 0) at top left to (0, 0) at bottom left
  return { x: 19 - y, y: x };
};

// function classNames(...classes) {
//   return classes.filter(Boolean).join(" ");
// }

// export functional component Header

export const Simulator = () => {
  const [robotState, setRobotState] = useState({
    x: 1,
    y: 1,
    d: Direction.NORTH,
    s: -1,
  });
  const [robotX, setRobotX] = useState(1);
  const [robotY, setRobotY] = useState(1);
  const [robotDir, setRobotDir] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [obXInput, setObXInput] = useState();
  const [obYInput, setObYInput] = useState();
  const [directionInput, setDirectionInput] = useState(ObDirection.NORTH);
  const [isComputing, setIsComputing] = useState(false);
  const [path, setPath] = useState([]);
  const [commands, setCommands] = useState([]);
  const [page, setPage] = useState(1);
  const [api, contextHolder] = notification.useNotification();

  const generateNewID = () => {
    while (true) {
      const new_id = Math.floor(Math.random() * 10) + 1; // just try to generate an id; d
      let ok = true;
      for (const ob of obstacles) {
        if (ob.id === new_id) {
          ok = false;
          break;
        }
      }
      if (ok) {
        return new_id;
      }
    }
  };

  const generateRobotCells = () => {
    const robotCells = [];
    let markerX = 0;
    let markerY = 0;

    if (Number(robotState.d) === Direction.NORTH) {
      markerY++;
    } else if (Number(robotState.d) === Direction.EAST) {
      markerX++;
    } else if (Number(robotState.d) === Direction.SOUTH) {
      markerY--;
    } else if (Number(robotState.d) === Direction.WEST) {
      markerX--;
    }

    // Go from i = -1 to i = 1
    for (let i = -1; i < 2; i++) {
      // Go from j = -1 to j = 1
      for (let j = -1; j < 2; j++) {
        // Transform the coordinates to our coordinate system where (0, 0) is at the bottom left
        const coord = transformCoord(robotState.x + i, robotState.y + j);
        // If the cell is the marker cell, add the robot state to the cell
        if (markerX === i && markerY === j) {
          robotCells.push({
            x: coord.x,
            y: coord.y,
            d: robotState.d,
            s: robotState.s,
          });
        } else {
          robotCells.push({
            x: coord.x,
            y: coord.y,
            d: null,
            s: -1,
          });
        }
      }
    }

    console.log(robotCells);
    return robotCells;
  };

  const onChangeNumber = (event, caller) => {
    if (event.target.value === "") {
      switch (caller) {
        case "ox":
          setObXInput("");
          break;
        case "oy":
          setObYInput("");
          break;
        case "rx":
          setRobotX(1);
          break;
        case "ry":
          setRobotY(1);
          break;
        default:
          break;
      }
      return;
    }
    // If the input is an integer and is in the range [0, 19], set ObYInput to the input
    if (Number.isInteger(Number(event.target.value))) {
      const nb = Number(event.target.value);
      if (nb >= 0 && nb <= 19) {
        switch (caller) {
          case "ox":
            setObXInput(nb);
            break;
          case "oy":
            setObYInput(nb);
            break;
          case "rx":
            setRobotX(nb);
            break;
          case "ry":
            setRobotY(nb);
            break;
          default:
            break;
        }
      }
    }
  };

  const onClickObstacle = () => {
    // If the input is not valid, return
    if (!obXInput && !obYInput) return;
    // If already exists, return
    for (const ob of obstacles) {
      if (ob.x === obXInput && ob.y === obYInput) {
        openNotificationWithIcon("error", "Error, Obstacle already exists");
        return;
      }
    }
    // Create a new array of obstacles
    const newObstacles = [...obstacles];
    // Add the new obstacle to the array
    newObstacles.push({
      x: obXInput,
      y: obYInput,
      d: directionInput,
      id: generateNewID(),
    });
    // Set the obstacles to the new array
    setObstacles(newObstacles);
    setObXInput("");
    setObYInput("");
  };

  const onDirectionInputChange = (event) => {
    // Set the direction input to the input
    setDirectionInput(Number(event.target.value));
  };

  const onRobotDirectionInputChange = (event) => {
    // Set the robot direction to the input
    setRobotDir(event.target.value);
  };

  const onRemoveObstacle = (ob) => {
    // If the path is not empty or the algorithm is computing, return
    if (path.length > 0 || isComputing) return;
    // Create a new array of obstacles
    const newObstacles = [];
    // Add all the obstacles except the one to remove to the new array
    for (const o of obstacles) {
      if (o.x === ob.x && o.y === ob.y) continue;
      newObstacles.push(o);
    }
    // Set the obstacles to the new array
    setObstacles(newObstacles);
  };

  const compute = () => {
    // Set computing to true, act like a lock
    setIsComputing(true);
    // Call the query function from the API
    QueryAPI.query(obstacles, robotX, robotY, robotDir, (data, err) => {
      if (data) {
        // If the data is valid, set the path
        setPath(data.data.path);
        // Set the commands
        const commands = [];
        for (const x of data.data.commands) {
          // If the command is a snapshot, skip it
          if (x.startsWith("SNAP")) {
            continue;
          }
          commands.push(x);
        }
        setCommands(commands);
      }
      // Set computing to false, release the lock
      setIsComputing(false);
    });
    onGeneratePath();
  };

  const onClearObstacles = () => {
    // Reset all the states
    setCommands([]);
    setPage(1);
    setObstacles([]);
    setPath([]);
  };

  const onResetRobot = () => {
    // Reset robot states
    setRobotX(1);
    setRobotDir(0);
    setRobotY(1);
    setRobotState({ x: 1, y: 1, d: Direction.NORTH, s: -1 });
    setPage(1);
  };

  const onGeneratePath = () => {
    setRobotState({
      x: robotX,
      y: robotY,
      d: robotDir,
      s: -1,
    });
    setPage(1);
  };

  const renderGrid = () => {
    // Initialize the empty rows array
    const rows = [];

    // Generate robot cells
    const robotCells = generateRobotCells();

    // Generate the grid
    for (let i = 0; i < 20; i++) {
      const cells = [
        // Header cells
        <td key={i} className="w-5 h-5 md:w-8 md:h-8">
          <span className="font-bold text-[0.6rem] md:text-base ">
            {19 - i}
          </span>
        </td>,
      ];

      for (let j = 0; j < 20; j++) {
        let foundOb = null;
        let foundRobotCell = null;

        for (const ob of obstacles) {
          const transformed = transformCoord(ob.x, ob.y);
          if (transformed.x === i && transformed.y === j) {
            foundOb = ob;
            break;
          }
        }

        if (!foundOb) {
          for (const cell of robotCells) {
            if (cell.x === i && cell.y === j) {
              foundRobotCell = cell;
              break;
            }
          }
        }

        if (foundOb) {
          if (foundOb.d === Direction.WEST) {
            cells.push(
              <td className="border border-l-4 border-l-red-500 w-5 h-5 md:w-8 md:h-8 obstacle-cell" />,
            );
          } else if (foundOb.d === Direction.EAST) {
            cells.push(
              <td className="border border-r-4 border-r-red-500 w-5 h-5 md:w-8 md:h-8 obstacle-cell" />,
            );
          } else if (foundOb.d === Direction.NORTH) {
            cells.push(
              <td className="border border-t-4 border-t-red-500 w-5 h-5 md:w-8 md:h-8 obstacle-cell" />,
            );
          } else if (foundOb.d === Direction.SOUTH) {
            cells.push(
              <td className="border border-b-4 border-b-red-500 w-5 h-5 md:w-8 md:h-8 obstacle-cell" />,
            );
          } else if (foundOb.d === Direction.SKIP) {
            cells.push(
              <td className="border w-5 h-5 md:w-8 md:h-8 obstacle-cell" />,
            );
          }
        } else if (foundRobotCell) {
          if (foundRobotCell.d !== null) {
            cells.push(
              <td
                className={`border w-5 h-5 md:w-8 md:h-8 ${
                  foundRobotCell.s !== -1
                    ? "robot-head-found"
                    : "robot-head-not-found"
                }`}
              />,
            );
          } else {
            cells.push(
              <td className="robot-cell border w-5 h-5 md:w-8 md:h-8" />,
            );
          }
        } else {
          cells.push(
            <td className="normal-cell border w-5 h-5 md:w-8 md:h-8" />,
          );
        }
      }

      rows.push(<tr key={19 - i}>{cells}</tr>);
    }

    const yAxis = [<td key={0} />];
    for (let i = 0; i < 20; i++) {
      yAxis.push(
        <td className="w-5 h-5 md:w-8 md:h-8">
          <span className="font-bold text-[0.6rem] md:text-base ">{i}</span>
        </td>,
      );
    }
    rows.push(<tr key={20}>{yAxis}</tr>);
    return rows;
  };

  const columns = [
    {
      title: "X",
      dataIndex: "x",
      key: "x",
      width: 170,
    },
    {
      title: "Y",
      dataIndex: "y",
      key: "y",
      width: 170,
    },
    {
      title: "Direction",
      dataIndex: "d",
      key: "d",
      width: 170,
      render: (text) => <span>{DirectionToString[text]}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" danger onClick={() => onRemoveObstacle(record)}>
          Delete
        </Button>
      ),
      width: 50,
    },
  ];

  const openNotificationWithIcon = (type, message) => {
    api[type]({
      message,
    });
  };

  useEffect(() => {
    if (page > path.length) return;
    setRobotState(path[page - 1]);
  }, [page, path]);

  useEffect(() => {
    setRobotState({
      x: robotX,
      y: robotY,
      d: robotDir,
      s: -1,
    });
  }, [robotX, robotY, robotDir]);

  return (
    <>
      {contextHolder}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="mb-8 mt-8 title">
          <h1 className="card-title text-4xl ">Algorithm Simulator</h1>
        </div>

        <div className="rounded-xl shadow-xl editor">
          <div className="card-body p-4">
            <h2 className="card-title ">Robot</h2>
            <div className="flex mb-2">
              <div className="input-group">
                <span className="">X</span>
                <input
                  onChange={(event) => onChangeNumber(event, "rx")}
                  type="number"
                  placeholder="0"
                  min="1"
                  max="18"
                  className="input w-2/3"
                  value={robotX}
                />
              </div>
              <div className="input-group">
                <span className="">Y</span>
                <input
                  onChange={(event) => onChangeNumber(event, "ry")}
                  type="number"
                  placeholder="0"
                  min="1"
                  max="18"
                  className="input w-2/3"
                  value={robotY}
                />
              </div>
              <label className="input-group">
                <span className="">D</span>
                <select
                  onChange={onRobotDirectionInputChange}
                  value={robotDir}
                  className="select w-2/3"
                >
                  <option value={ObDirection.NORTH}>Up</option>
                  <option value={ObDirection.SOUTH}>Down</option>
                  <option value={ObDirection.WEST}>Left</option>
                  <option value={ObDirection.EAST}>Right</option>
                </select>
              </label>
            </div>
            <button className="btn general-btn p-2" onClick={onResetRobot}>
              Reset Robot
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow-xl editor mt-8 mb-4">
          <div className="card-body p-4">
            <h2 className="card-title ">Obstacles</h2>
            <div className="flex mb-2">
              <div className="input-group">
                <span className="">X</span>
                <input
                  onChange={(event) => onChangeNumber(event, "ox")}
                  type="number"
                  placeholder="0"
                  min="0"
                  max="19"
                  className="input w-2/3"
                  value={obXInput}
                />
              </div>
              <div className="input-group">
                <span className="">Y</span>
                <input
                  onChange={(event) => onChangeNumber(event, "oy")}
                  type="number"
                  placeholder="0"
                  min="0"
                  max="19"
                  className="input w-2/3"
                  value={obYInput}
                />
              </div>
              <div className="input-group">
                <span className="">D</span>
                <select
                  onChange={onDirectionInputChange}
                  value={directionInput}
                  className="select w-2/3"
                >
                  <option value={ObDirection.NORTH}>Up</option>
                  <option value={ObDirection.SOUTH}>Down</option>
                  <option value={ObDirection.WEST}>Left</option>
                  <option value={ObDirection.EAST}>Right</option>
                  <option value={ObDirection.SKIP}>None</option>
                </select>
              </div>
            </div>
            <button className="btn general-btn p-2" onClick={onClickObstacle}>
              ADD
            </button>
          </div>
        </div>

        <div className="rounded-xl shadow-xl editor mt-8 mb-12 ">
          <div className="card-body p-4">
            <h2 className="card-title ">Obstacle List</h2>
            <Table columns={columns} dataSource={obstacles} />
            <button
              className="btn general-btn p-2 mt-2"
              onClick={onClearObstacles}
            >
              Clear Obstacles
            </button>
          </div>
        </div>

        <table>
          <tbody>{renderGrid()}</tbody>
        </table>

        <div className="btn-group py-4 action-btn-group mt-2">
          <button className="btn general-btn w-full" onClick={compute}>
            Generate Path
          </button>
        </div>

        <div className="editor items-center text-center p-4 rounded-xl shadow-xl mt-4 mb-8">
          <h2 className="card-title flex-col mb-4">{commands[page - 1]}</h2>
          <Pagination
            responsive={true}
            defaultCurrent={1}
            defaultPageSize={10}
            total={10 * path.length}
            // total={500}
            showSizeChanger={false}
            current={page}
            onChange={(page) => {
              setPage(page);
            }}
          />
        </div>
      </div>
    </>
  );
};
