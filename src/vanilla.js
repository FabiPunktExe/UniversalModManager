function registerVanillaVersion(versions, version) {
    versions.push({
        id: "vanilla-" + version,
        name: "Minecraft " + version,
        installer: (minecraftFolder) => {
            
        }
    })
}

module.exports.registerVersions = (versions) => {
    registerVanillaVersion(versions, "1.14.4")
    registerVanillaVersion(versions, "1.15")
    registerVanillaVersion(versions, "1.15.1")
    registerVanillaVersion(versions, "1.15.2")
    registerVanillaVersion(versions, "1.16")
    registerVanillaVersion(versions, "1.16.1")
    registerVanillaVersion(versions, "1.16.2")
    registerVanillaVersion(versions, "1.16.3")
    registerVanillaVersion(versions, "1.16.4")
    registerVanillaVersion(versions, "1.16.5")
    registerVanillaVersion(versions, "1.17")
    registerVanillaVersion(versions, "1.17.1")
    registerVanillaVersion(versions, "1.18")
    registerVanillaVersion(versions, "1.18.1")
    registerVanillaVersion(versions, "1.18.2")
    registerVanillaVersion(versions, "1.19")
    registerVanillaVersion(versions, "1.19.1")
    registerVanillaVersion(versions, "1.19.2")
    registerVanillaVersion(versions, "1.19.3")
}