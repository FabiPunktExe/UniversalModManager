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

function addDependencies(selectedMods, mods) {
    selectedMods.forEach(selectedMod => {
        selectedMod = mods.find(mod => mod.id == selectedMod)
        selectedMod.dependencies.forEach(dependency => {
            selectedMods = selectedMods.concat(addDependencies([dependency], mods))
        })
    })
    return selectedMods
}

module.exports.installMods = (profile, mods) => {
    const files = readdirSync(modsdir())
    addDependencies(profile.mods, mods).forEach(mod => {
        mod = this.getModById(mod, mods)
        const modFile = mod.id + ".jar"
        const fileIndex = files.findIndex(file => file == modFile)
        console.log(fileIndex)
        if (fileIndex != -1) files.splice(fileIndex, 1)
        else {
            const cacheFile = join(modscache(), modFile)
            if (!existsSync(cacheFile)) execSync("curl -o \"" + cacheFile + "\" \"" + mod.url + "\"")
            copyFileSync(cacheFile, join(modsdir(), modFile))
        }
    })
    files.forEach(file => unlinkSync(join(modsdir(), file)))
}