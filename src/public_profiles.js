const { get } = require("request")

function loadPublicProfile(lines) {
    const profile = {
        name: "",
        id: "",
        description: "",
        version: "",
        mods: []
    }
    lines.forEach(line => {
        const data = line.split(";")
        if (data.length >= 2 && data[0] == "id") profile.id = data[1]
        else if (data.length >= 2 && data[0] == "name") profile.name = data[1]
        else if (data.length >= 2 && data[0] == "description") profile.description = data[1]
        else if (data.length >= 2 && data[0] == "version") profile.version = data[1]
        else if (data.length >= 2 && data[0] == "mod") profile.mods.push(data[1])
    })
    return profile
}

function loadPublicProfiles(url, profiles, callback) {
    get(url, {}, (error, response, body) => {
        body.split("\n").forEach(line => {
            if (line != "") {
                console.log("line: " + line)
                get(line, {}, (error, response, body2) => {
                    console.log(body2)
                    profiles.push(loadPublicProfile(body2.split("\n")))
                })
            }
        })
    })
}

module.exports.loadPublicProfiles = (profiles, callback) => {
    while (profiles.length) profiles.splice(0, profiles.length)
    loadPublicProfiles("https://mrstupsi.github.io/UMMMods/public_profiles/public_profiles.txt", profiles, callback)
}