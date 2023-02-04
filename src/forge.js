const { readdirSync, createWriteStream, existsSync, WriteStream } = require("fs")
const { tmpdir } = require("os")
const { join } = require("path")
const { get } = require("request")
const { versiondir, mcdir } = require("./mcutil")
const {  spawn } = require("child_process")
const { Writable } = require("stream")

function downloadForgeInstaller(version, callback) {
    get(
        "https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json",
        {json: true},
        (error, response, body) => {
            const id = body[version].reverse()[0]
            if (id) {
                const installer = join(tmpdir(), "forge-" + id + "-installer.jar")
                if (existsSync(installer)) callback(installer)
                else {
                    get(
                        "https://files.minecraftforge.net/maven/net/minecraftforge/forge/" + id + "/forge-" + id + "-installer.jar",
                        {json: true}
                    ).pipe(createWriteStream(installer)).on("finish", () => callback(installer))
                }
            }
        }
    )
}

function registerForgeVersion(versions, version) {
    versions.push({
        id: "forge-" + version,
        name: "Forge " + version,
        isInstalled: () => {
            const files = readdirSync(versiondir())
            return files.find(dir => dir.startsWith(version + "-forge-")) != undefined
        },
        install: (callback) => {
            downloadForgeInstaller(version, installer => {
                spawn("java", [
                    "-cp",
                    installer + ";" + join(__dirname, "ForgeInstallerLauncher.jar"),
                    "Launcher",
                    mcdir()
                ]).on("exit", callback).stdout.pipe(createWriteStream(join(tmpdir(), installer + ".log")))
            })
        }
    })
}

module.exports.registerVersions = (versions) => {
    registerForgeVersion(versions, "1.14.4")
    registerForgeVersion(versions, "1.15")
    registerForgeVersion(versions, "1.15.1")
    registerForgeVersion(versions, "1.15.2")
    registerForgeVersion(versions, "1.16")
    registerForgeVersion(versions, "1.16.1")
    registerForgeVersion(versions, "1.16.2")
    registerForgeVersion(versions, "1.16.3")
    registerForgeVersion(versions, "1.16.4")
    registerForgeVersion(versions, "1.16.5")
    registerForgeVersion(versions, "1.17")
    registerForgeVersion(versions, "1.17.1")
    registerForgeVersion(versions, "1.18")
    registerForgeVersion(versions, "1.18.1")
    registerForgeVersion(versions, "1.18.2")
    registerForgeVersion(versions, "1.19")
    registerForgeVersion(versions, "1.19.1")
    registerForgeVersion(versions, "1.19.2")
    registerForgeVersion(versions, "1.19.3")
}