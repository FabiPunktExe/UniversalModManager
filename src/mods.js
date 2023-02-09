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
                const data = line.split(";")
                mods.push({
                    name: data[0],
                    id: data[1],
                    url: data[2],
                    versions: data[3] == "" ? [] : data[3].split(","),
                    dependencies: data[4] == "" ? [] : data[4].split(",")
                })
            }
        })
        callback()
    })
}

module.exports.installMod = (mod, mods, installedMods) => {
    mod = this.getModById(mod, mods)
    if (!mod) return
    mod.dependencies.forEach(dependency => this.installMod(dependency, mods, installedMods))
    const modFile = mod.id + ".jar"
    if (existsSync(join(modsdir(), modFile))) {
        installedMods = installedMods.filter(mod => mod != modFile)
    } else {
        const cacheFile = join(modscache(), modFile)
        if (!existsSync(cacheFile)) execSync("curl -o \"" + cacheFile + "\" \"" + mod.url + "\"")
        copyFileSync(cacheFile, join(modsdir(), modFile))
        installedMods = installedMods.filter(mod => mod != modFile)
    }
    return installedMods
}

module.exports.installMods = (profile, mods) => {
    var installedMods = readdirSync(modsdir())
    profile.mods.forEach(mod => installedMods = this.installMod(mod, mods, installedMods))
    installedMods.forEach(mod => unlinkSync(join(modsdir(), mod)))
}