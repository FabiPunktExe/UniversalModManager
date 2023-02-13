module.exports.loadVersions = (versions, callback) => {
    require("./vanilla").registerVersions(versions)
    require("./fabric").registerVersions(versions, () => {
        require("./forge").registerVersions(versions, callback)
    })
}

module.exports.getById = (versions, id) => {
    versions.find(version => version.id == id);
}