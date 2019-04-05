import * as vfs from "../index"
import { assert } from "chai"
import * as path from "path"

describe("readFile", () => {
    it("local", async () => {
        const result = vfs.readFile("src/index.ts")
        assert.notStrictEqual(result, undefined)
    })
    it("https", async () => {
        const result = await vfs.readFile(
            "https://raw.githubusercontent.com/ts-common/virtual-fs/f836275cd31ecd1fca9c1de9535aea734d642fa6/README.md"
        )
        assert.strictEqual(result, "# virtual-fs\nVirtual File System\n")
    })
    it("throws if doesn't exist", async () => {
        let hasThrown = false;
        try {
            await vfs.readFile(
                "https://raw.githubusercontent.com/Azure/this-repo-doesntexist/exist"
            )
        } catch {
            hasThrown = true
        }
        assert.isTrue(hasThrown)
    })
})

describe("pathResolve", () => {
    it("local", () => {
        const result = vfs.pathResolve("index.ts")
        assert.strictEqual(result, path.resolve("index.ts"))
    })
    it("https", () => {
        const result = vfs.pathResolve("https://github.com")
        assert.strictEqual(result, "https://github.com")
    })
})

describe("pathJoin", () => {
    it("local", () => {
        const result = vfs.pathJoin("folder", "name")
        assert.strictEqual(result, "folder" + path.sep + "name")
    })
    it("https", () => {
        const result = vfs.pathJoin("https://github.com", "ts-common")
        assert.strictEqual(result, "https://github.com/ts-common")
    })
})

describe("exists", () => {
    it("local", async () => {
        const result = await vfs.exists("src/index.ts")
        assert.isTrue(result)
    })
    it("https", async () => {
        const result = await vfs.exists(
            "https://raw.githubusercontent.com/ts-common/virtual-fs/f836275cd31ecd1fca9c1de9535aea734d642fa6/README.md"
        )
        assert.isTrue(result)
    })
})

describe("doesn't exist", () => {
    it("local", async () => {
        const result = await vfs.exists("thisprobablydoesntexist.ts")
        assert.isFalse(result)
    })
    it("https", async () => {
        const result = await vfs.exists(
            "https://raw.githubusercontent.com/Azure/this-repo-doesntexist/exist"
        )
        assert.isFalse(result)
    })
})

describe("pathDirName", () => {
    it("local", () => {
        const result = vfs.pathDirName("folder/index.d.ts")
        assert.strictEqual(result, "folder")
    })
    it("https", () => {
        const result = vfs.pathDirName(
            "https://raw.githubusercontent.com/ts-common/virtual-fs/f836275cd31ecd1fca9c1de9535aea734d642fa6/README.md"
        )
        assert.strictEqual(
            result,
            "https://raw.githubusercontent.com/ts-common/virtual-fs/f836275cd31ecd1fca9c1de9535aea734d642fa6"
        )
    })
    it("domain name", () => {
        const result = vfs.pathDirName("https://raw.githubusercontent.com")
        assert.strictEqual(result, "https://raw.githubusercontent.com")
    })
})
