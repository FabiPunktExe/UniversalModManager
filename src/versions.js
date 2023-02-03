module.exports.loadVersions = (versions) => {
    require("./vanilla").registerVersions(versions)
}

module.exports.getById = (versions, id) => {
    versions.find(version => version.id == id);
}