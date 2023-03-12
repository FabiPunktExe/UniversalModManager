const { execSync } = require("child_process")
const { readdirSync, existsSync, unlinkSync, copyFileSync } = require("fs")
const { join } = require("path")
const { get } = require("request")
const { modscache, modsdir } = require("./mcutil")

module.exports.getModById = (id, mods) => {
    return mods.find(mod => mod.id == id)
}

function processRegister(register, mods, callback, name, description, tags) {
    if (register.length > 0) {
        const line = register[0]
        const data = line.split(";")
        const next = (name, description, tags) => processRegister(register.slice(1), mods, callback, name, description, tags)
        if (line.startsWith("//")) next(name, description, tags)
        else if (data.length >= 2 && data[0] == "name") {
            name = data.slice(1).join(" ")
            next(name, description, tags)
        } else if (data.length >= 2 && data[0] == "description") {
            description = data.slice(1).join(" ")
            next(name, description, tags)
        } else if (data.length >= 2 && data[0] == "tags") {
            tags = data.slice(1)[0].split(",")
            next(name, description, tags)
        } else if (data.length >= 2 && data[0] == "register") loadMods(data[1], mods, () => next(name, description, tags))
        else if (data.length >= 5 && data[0] == "mod") {
            mods.push({
                name: name.slice(),
                id: data[1],
                description: description.slice(),
                tags: tags.slice(),
                versions: data[2] == "" ? [] : data[2].split(","),
                dependencies: data[3] == "" ? [] : data[3].split(","),
                url: data[4]
            })
            next(name, description, tags)
        } else next(name, description, tags)
    } else callback()
}

function loadMods(url, mods, callback) {
    get(url, {}, (error, response, body) => processRegister(body.split("\n"), mods, callback, undefined, undefined, undefined))
}

module.exports.loadMods = (mods, callback) => {
    while (mods.length) mods.splice(0, mods.length)
    loadMods("https://mrstupsi.github.io/UMMMods/registers.txt", mods, callback)
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