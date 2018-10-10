import * as fsp from "@ts-common/fs"
import * as https from "@ts-common/https"
import * as path from "path"
import * as it from "@ts-common/iterator"

interface Url {
    readonly protocol: string
    readonly path: string
}

const protocolSeparator = "://"

const toUrlString = (url: Url) => url.protocol + protocolSeparator + url.path

const urlParse = (dir: string): Url|undefined => {
    const split = dir.split(protocolSeparator)
    return split.length === 2 ?
        {
            protocol: split[0],
            path: split[1]
        } :
        undefined
}

export const readFile = async (pathStr: string): Promise<string> => {
    const result = urlParse(pathStr)
    return result === undefined ?
        (await fsp.readFile(pathStr)).toString() :
        await https.getBody(pathStr)
}

export const pathResolve = (dir: string): string =>
    urlParse(dir) !== undefined ? dir : path.resolve(dir)

export const pathJoin = (dir: string, value: string): string => {
    const url = urlParse(dir)
    return url !== undefined ?
        toUrlString({
            protocol: url.protocol,
            path: it.join(it.concat(url.path.split("/"), [value]), "/")
        }) :
        path.join(dir, value)
}

export const exists = async (dir: string): Promise<boolean> => {
    if (urlParse(dir) !== undefined) {
        const result = await https.get(dir)
        return result.statusCode === 200
    } else {
        return fsp.exists(dir)
    }
}

export const pathDirName = (dir: string): string => {
    const url = urlParse(dir)
    if (url === undefined) {
        return path.dirname(dir)
    }
    const split = url.path.split("/")
    return toUrlString({
        protocol: url.protocol,
        path: split.length <= 1 ? url.path : it.join(it.dropRight(split), "/")
    })
}
