const { existsSync, mkdirSync, readFile, readFileSync } = require("fs")
const { homedir } = require("os")
const { join } = require("path")

function getMinecraftDir() {
	if (process.platform === "win32") {
		return join(homedir(), "AppData", "Roaming", ".minecraft")
	} else if (process.platform === "darwin") {
		return join(homedir(), "Library", "Application", "Support", "minecraft")
	} else if (process.platform === "linux") {
		return join(homedir(), ".minecraft")
	} else {
		throw new Error(process.platform + " is not supported!")
	}
}

module.exports.mcdir = () => {
    return getMinecraftDir()
}

module.exports.versiondir = () => {
	const path = join(getMinecraftDir(), "versions")
	if (!existsSync(path)) mkdirSync(path, {recursive: true})
	return path
}

module.exports.modscache = () => {
	const path = join(getMinecraftDir(), "UniversalModManager", "cache")
	if (!existsSync(path)) mkdirSync(path, {recursive: true})
	return path
}

module.exports.modsdir = () => {
	const path = join(getMinecraftDir(), "mods")
	if (!existsSync(path)) mkdirSync(path, {recursive: true})
	return path
}