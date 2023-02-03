const { homedir } = require("os")
const { join } = require("path")

module.exports.mcdir = () => {
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