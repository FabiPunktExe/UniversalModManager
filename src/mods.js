const { execSync } = require("child_process")
const { readdirSync, existsSync, unlinkSync, copyFileSync } = require("fs")
const { join } = require("path")
const { get } = require("request")
const { modscache, modsdir } = require("./mcutil")

module.exports.getModById = (id, mods) => {
    return mods.filter(mod => mod.id == id)[0]
}

module.exports.loadMods = (mods, callback) => {
    while (mods.length) mods.pop()
    get("https://mrstupsi.github.io/UniversalModManager/mods.txt", {}, (error, response, body) => {
        const lines = body.split("\n")
        lines.forEach(line => {
            if (!line.startsWith("//")) {
                if (line != "") {
                    const data = line.split(";")
                    mods.push({
                        name: data[0],
                        id: data[1],
                        url: data[2],
                        versions: data[3] == "" ? [] : data[3].split(","),
                        dependencies: data[4] == "" ? [] : data[4].split(","),
                        description: data[5],
                        tags: data[6] == "" ? [] : data[6].split(",")
                    })
                }
            }
        })
        callback()
    })
}

module.exports.installMods = (profile, mods) => {
    const installedMods = readdirSync(modsdir())
    profile.mods.forEach((mod) => {
        mod = this.getModById(mod, mods)
        const modFile = mod.url.substring(mod.url.lastIndexOf("/") + 1)
        if (modFile in installedMods) installedMods.splice(installedMods.indexOf(mod.id))
        else {
            const cacheFile = join(modscache(), modFile)
            if (!existsSync(cacheFile)) execSync("curl -o \"" + cacheFile + "\" \"" + mod.url + "\"")
            copyFileSync(cacheFile, join(modsdir(), modFile))
            installedMods.splice(installedMods.indexOf(mod.id))
        }
    })
    installedMods.forEach(mod => unlinkSync(join(modsdir(), mod)))
}