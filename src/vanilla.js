const { writeFile, existsSync, mkdirSync } = require("fs")
const { join } = require("path")
const { get } = require("request")
const { versiondir } = require("./mcutil")

module.exports.writeJson = (json, version, callback) => {
    const dir = join(versiondir(), version)
	if (!existsSync(dir)) mkdirSync(dir, {recursive: true})
    const file = join(dir, version + ".json")
    writeFile(file, JSON.stringify(json), callback)
}

module.exports.getVanillaJson = (version, callback) => {
    get(
        "https://launchermeta.mojang.com/mc/game/version_manifest.json",
        {json: true},
        (error, response, body) => {
            const manifest = body.versions.find(ver => ver.id == version)
            if (manifest) {
                const url = manifest.url
                get(url, {json: true}, (error, response, body) => {
                    callback(body)
                })
            }
        }
    )
}

function registerVanillaVersion(versions, version) {
    versions.push({
        id: "vanilla-" + version,
        name: "Minecraft " + version,
        mcid: version,
        isInstalled: () => existsSync(join(versiondir(), version)),
        install: (callback) => {
            getVanillaJson(version, json => writeJson(json, json.id, callback))
        }
    })
}

module.exports.registerVersions = (versions) => {
    registerVanillaVersion(versions, "1.14.4")
    registerVanillaVersion(versions, "1.15")
    registerVanillaVersion(versions, "1.15.1")
    registerVanillaVersion(versions, "1.15.2")
    registerVanillaVersion(versions, "1.16")
    registerVanillaVersion(versions, "1.16.1")
    registerVanillaVersion(versions, "1.16.2")
    registerVanillaVersion(versions, "1.16.3")
    registerVanillaVersion(versions, "1.16.4")
    registerVanillaVersion(versions, "1.16.5")
    registerVanillaVersion(versions, "1.17")
    registerVanillaVersion(versions, "1.17.1")
    registerVanillaVersion(versions, "1.18")
    registerVanillaVersion(versions, "1.18.1")
    registerVanillaVersion(versions, "1.18.2")
    registerVanillaVersion(versions, "1.19")
    registerVanillaVersion(versions, "1.19.1")
    registerVanillaVersion(versions, "1.19.2")
    registerVanillaVersion(versions, "1.19.3")
}