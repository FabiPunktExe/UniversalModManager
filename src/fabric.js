const { existsSync } = require("fs")
const { get } = require("request")
const { join } = require("path")
const { versiondir } = require("./mcutil")
const { writeJson } = require("./vanilla.js")

function getNewestFabricVersion(callback) {
    get(
        "https://meta.fabricmc.net/v2/versions/loader",
        {json: true},
        (error, response, body) => callback(body[0].version)
    )
}

function getFabricJson(version, fabricVersion, callback) {
    const mcid = "fabric-loader-" + fabricVersion + "-" + version
    get(
        "https://meta.fabricmc.net/v2/versions/loader/" + version + "/" + fabricVersion,
        {json: true},
        (error, response, body) => {
            if (!(body instanceof String)) {
                var libraries = []
                libraries = libraries.concat(body.launcherMeta.libraries.client)
                libraries = libraries.concat(body.launcherMeta.libraries.common)
                libraries.push({
                    name: "net.fabricmc:intermediary:" + version,
                    url: "https://maven.fabricmc.net/"
                })
                libraries.push({
                    name: "net.fabricmc:fabric-loader:" + fabricVersion,
                    url: "https://maven.fabricmc.net/"
                })
                const json = {
                    inheritsFrom: version,
                    releaseTime: "2023-02-02T16:01:11+0000",
                    mainClass: body.launcherMeta.mainClass.client,
                    libraries: libraries,
                    arguments: {
                        jvm: ["-DFabricMcEmu= net.minecraft.client.main.Main "],
                        game: []
                    },
                    id: mcid,
                    time: "2023-02-02T16:01:11+0000",
                    type: (body.intermediary.stable ? "release" : "snapshot")
                }
                callback(json)
            }
        }
    )
}

function registerFabricVersion(versions, fabricVersion, version) {
    const mcid = "fabric-loader-" + fabricVersion + "-" + version
    get(
        "https://meta.fabricmc.net/v2/versions/loader/" + version + "/" + fabricVersion,
        {json: true},
        (error, response, body) => {
            if (!(body instanceof String)) {
                versions.push({
                    id: "fabric-" + version,
                    name: "Fabric " + version,
                    mcid: mcid,
                    isInstalled: () => existsSync(join(versiondir(), mcid)),
                    install: callback => {
                        getFabricJson(version, fabricVersion, json => writeJson(json, mcid, callback))
                    }
                })
            }
        }
    )
}

module.exports.registerVersions = (versions, callback) => {
    getNewestFabricVersion(fabricVersion => {
        registerFabricVersion(versions, fabricVersion, "1.14.4")
        registerFabricVersion(versions, fabricVersion, "1.15")
        registerFabricVersion(versions, fabricVersion, "1.15.1")
        registerFabricVersion(versions, fabricVersion, "1.15.2")
        registerFabricVersion(versions, fabricVersion, "1.16")
        registerFabricVersion(versions, fabricVersion, "1.16.1")
        registerFabricVersion(versions, fabricVersion, "1.16.2")
        registerFabricVersion(versions, fabricVersion, "1.16.3")
        registerFabricVersion(versions, fabricVersion, "1.16.4")
        registerFabricVersion(versions, fabricVersion, "1.16.5")
        registerFabricVersion(versions, fabricVersion, "1.17")
        registerFabricVersion(versions, fabricVersion, "1.17.1")
        registerFabricVersion(versions, fabricVersion, "1.18")
        registerFabricVersion(versions, fabricVersion, "1.18.1")
        registerFabricVersion(versions, fabricVersion, "1.18.2")
        registerFabricVersion(versions, fabricVersion, "1.19")
        registerFabricVersion(versions, fabricVersion, "1.19.1")
        registerFabricVersion(versions, fabricVersion, "1.19.2")
        registerFabricVersion(versions, fabricVersion, "1.19.3")
        callback()
    })
}