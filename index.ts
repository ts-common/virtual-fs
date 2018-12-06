import * as fsp from "@ts-common/fs";
import * as it from "@ts-common/iterator";
import fetch from "node-fetch";
import * as path from "path";
import retry from "async-retry";

interface Url {
  readonly protocol: string;
  readonly path: string;
}

const protocolSeparator = "://";

const toUrlString = (url: Url) => url.protocol + protocolSeparator + url.path;

const urlParse = (dir: string): Url | undefined => {
  const split = dir.split(protocolSeparator);
  return split.length === 2
    ? {
      protocol: split[0],
      path: split[1]
    }
    : undefined;
};

export const readFile = async (pathStr: string): Promise<string> => {
  const result = urlParse(pathStr);
  return result === undefined
    ? (await fsp.readFile(pathStr)).toString()
    : await getByUrl(pathStr);
};

const getByUrl = async (url: string) => {
  return retry<string>(
    async (bail, retryNr): Promise<string> => {
      try {
        const response = await fetch(url);
        const body = await response.text();

        if (response.status !== 200) {
          const msg = `StatusCode: "${
            response.status
            }", ResponseBody: "${body}."`;

          bail(new Error(msg));
        }

        return body;
      } catch (fetchError) {
        const message = `Request to ${url} failed with error ${fetchError} on
                        retry number ${retryNr}.`;

        throw new Error(message);
      }
    },
    {
      retries: 3,
      factor: 1
    }
  );
};

export const pathResolve = (dir: string): string =>
  urlParse(dir) !== undefined ? dir : path.resolve(dir);

export const pathJoin = (dir: string, value: string): string => {
  const url = urlParse(dir);
  return url !== undefined
    ? toUrlString({
      protocol: url.protocol,
      path: it.join(it.concat(url.path.split("/"), [value]), "/")
    })
    : path.join(dir, value);
};

export const exists = async (dir: string): Promise<boolean> => {
  if (urlParse(dir) !== undefined) {
    try {
      return retry(
        async (): Promise<boolean> => {
          const { status } = await fetch(dir);

          if (status !== 200) {
            const msg = `StatusCode "${status}" for "${dir}"`;

            throw new Error(msg);
          }

          return true;
        },
        {
          retries: 3,
          factor: 1
        }
      );
    } catch (e) {
      return false;
    }
  } else {
    return fsp.exists(dir);
  }
};

export const pathDirName = (dir: string): string => {
  const url = urlParse(dir);
  if (url === undefined) {
    return path.dirname(dir);
  }
  const split = url.path.split("/");
  return toUrlString({
    protocol: url.protocol,
    path: split.length <= 1 ? url.path : it.join(it.dropRight(split), "/")
  });
};
