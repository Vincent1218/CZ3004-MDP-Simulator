import { methodType, API } from "./consts";

export class CustomError extends Error {
  content;

  constructor(content) {
    super();
    this.content = content;
  }

  msg(s) {
    this.message = s;
  }
}

export default class BaseAPI {
  static JSONRequest(api, method, headers, options, content) {
    const host = API;

    const requestOptions = {
      method,
      headers: { ...headers, "Content-Type": "application/json" },
      ...options,
    };

    if (method === methodType.post || method === methodType.put) {
      requestOptions.body = JSON.stringify(content);
    }

    return new Promise((resolve, reject) => {
      fetch(host + api, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new CustomError(response);
          }

          response
            .json()
            .then((res) => {
              if (res.error) {
                reject(JSON.stringify(res.error));
              }
              resolve(res.data);
            })
            .catch(() => {
              resolve({});
            });
        })
        .catch(async (err) => {
          console.log(err);
          if (err instanceof CustomError) {
            // best effort to capture all cases of err handling
            const errStr = await err.content
              .json()
              .then((res) => {
                if (res.errors) {
                  return JSON.stringify(res.errors);
                }

                return "";
              })
              .catch(() => {
                return "";
              });

            err.msg(errStr);
            reject(err);
          } else {
            reject(err);
          }
        });
    });
  }
}
