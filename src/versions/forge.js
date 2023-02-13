const { createWriteStream, existsSync } = require("fs")
const { tmpdir } = require("os")
const { join } = require("path")
const { get } = require("request")
const { spawn } = require("child_process")
const { versiondir, mcdir } = require("../mcutil")

function getForgeManifest(callback) {
    get(
        "https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json",
        {json: true},
        (error, response, body) => callback(body)
    )
}

function getNewestForgeVersion(manifest, version) {
    return manifest[version].reverse()[0].replace(version + "-", "")
}

function downloadForgeInstaller(version, forgeVersion, callback) {
    const id = version + "-" + forgeVersion
    const installer = join(tmpdir(), "forge-" + id + "-installer.jar")
    if (existsSync(installer)) callback(installer)
    else {
        get(
            "https://files.minecraftforge.net/maven/net/minecraftforge/forge/" + id + "/forge-" + id + "-installer.jar",
            {json: true}
        ).pipe(createWriteStream(installer)).on("finish", () => callback(installer))
    }
}

function registerForgeVersion(versions, manifest, version) {
    const data = manifest[version]
    if (data) {
        const forgeVersion = getNewestForgeVersion(manifest, version)
        const mcid = version + "-forge-" + forgeVersion
        versions.push({
            id: "forge-" + version,
            name: "Forge " + version,
            mcid: mcid,
            isInstalled: () => existsSync(join(versiondir(), mcid)),
            install: callback => {
                downloadForgeInstaller(version, forgeVersion, (installer) => {
                    spawn("java", [
                        "-cp",
                        installer + ";" + join(__dirname, "ForgeInstallerLauncher.jar"),
                        "Launcher",
                        mcdir()
                    ]).on("exit", callback).stdout.pipe(createWriteStream(installer + ".log"))
                })
            }
        })
    }
}

module.exports.registerVersions = (versions, callback) => {
    getForgeManifest(manifest => {
        registerForgeVersion(versions, manifest, "1.14.4")
        registerForgeVersion(versions, manifest, "1.15")
        registerForgeVersion(versions, manifest, "1.15.1")
        registerForgeVersion(versions, manifest, "1.15.2")
        registerForgeVersion(versions, manifest, "1.16")
        registerForgeVersion(versions, manifest, "1.16.1")
        registerForgeVersion(versions, manifest, "1.16.2")
        registerForgeVersion(versions, manifest, "1.16.3")
        registerForgeVersion(versions, manifest, "1.16.4")
        registerForgeVersion(versions, manifest, "1.16.5")
        registerForgeVersion(versions, manifest, "1.17")
        registerForgeVersion(versions, manifest, "1.17.1")
        registerForgeVersion(versions, manifest, "1.18")
        registerForgeVersion(versions, manifest, "1.18.1")
        registerForgeVersion(versions, manifest, "1.18.2")
        registerForgeVersion(versions, manifest, "1.19")
        registerForgeVersion(versions, manifest, "1.19.1")
        registerForgeVersion(versions, manifest, "1.19.2")
        registerForgeVersion(versions, manifest, "1.19.3")
        callback()
    })
}