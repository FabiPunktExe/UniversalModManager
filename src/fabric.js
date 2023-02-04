const { readdirSync } = require("fs")
const { join } = require("path")
const { get } = require("request")
const { versiondir } = require("./mcutil")
const { writeJson } = require("./vanilla.js")

function getFabricJson(version, callback) {
    get(
        "https://meta.fabricmc.net/v2/versions/loader/" + version,
        {json: true},
        (error, response, body) => {
            const manifest = body.find(ver => ver.loader.stable && ver.intermediary.stable)
            if (manifest) {
                const id = "fabric-loader-" + manifest.loader.version + "-" + manifest.intermediary.version
                var libraries = []
                libraries = libraries.concat(manifest.launcherMeta.libraries.client)
                libraries = libraries.concat(manifest.launcherMeta.libraries.common)
                libraries.push({
                    name: "net.fabricmc:intermediary:" + manifest.intermediary.version,
                    url: "https://maven.fabricmc.net/"
                })
                libraries.push({
                    name: "net.fabricmc:fabric-loader:" + manifest.loader.version,
                    url: "https://maven.fabricmc.net/"
                })
                const json = {
                    inheritsFrom: version,
                    releaseTime: "2023-02-02T16:01:11+0000",
                    mainClass: manifest.launcherMeta.mainClass.client,
                    libraries: libraries,
                    arguments: {
                        jvm: ["-DFabricMcEmu= net.minecraft.client.main.Main "],
                        game: []
                    },
                    id: id,
                    time: "2023-02-02T16:01:11+0000",
                    type: (manifest.intermediary.stable ? "release" : "snapshot")
                }
                callback(json)
            }
        }
    )
}

function registerFabricVersion(versions, version) {
    versions.push({
        id: "fabric-" + version,
        name: "Fabric " + version,
        isInstalled: () => {
            const files = readdirSync(versiondir())
            return files.find(dir => {
                return dir.startsWith("fabric-loader-") &&
                       dir.endsWith("-" + version)
            }) != undefined
        },
        install: (callback) => {
            console.log(callback)
            getFabricJson(version, json => writeJson(json, json.id, callback))
        }
    })
}

module.exports.registerVersions = (versions) => {
    registerFabricVersion(versions, "1.14.4")
    registerFabricVersion(versions, "1.15")
    registerFabricVersion(versions, "1.15.1")
    registerFabricVersion(versions, "1.15.2")
    registerFabricVersion(versions, "1.16")
    registerFabricVersion(versions, "1.16.1")
    registerFabricVersion(versions, "1.16.2")
    registerFabricVersion(versions, "1.16.3")
    registerFabricVersion(versions, "1.16.4")
    registerFabricVersion(versions, "1.16.5")
    registerFabricVersion(versions, "1.17")
    registerFabricVersion(versions, "1.17.1")
    registerFabricVersion(versions, "1.18")
    registerFabricVersion(versions, "1.18.1")
    registerFabricVersion(versions, "1.18.2")
    registerFabricVersion(versions, "1.19")
    registerFabricVersion(versions, "1.19.1")
    registerFabricVersion(versions, "1.19.2")
    registerFabricVersion(versions, "1.19.3")
}