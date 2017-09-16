const fs = require("fs");
const request = require("request");

const branch = process.env.CIRCLE_BRANCH;
const githubUsername = process.env.CIRCLE_PROJECT_USERNAME;
const githubRepository = process.env.CIRCLE_PROJECT_REPONAME;

const artifactUrl = `https://circleci.com/api/v1.1/project/github/${githubUsername}/${githubRepository}/latest/artifacts`;

function retrieveLatestRecords({ artifactUrl, branch }) {
  return new Promise((resolve, reject) => {
    if (!process.env.CIRCLE_TOKEN) {
      return reject(new Error("No CIRCLE CI token found"));
    }

    if (!branch || branch !== "master") {
      console.log("skipping non-master branch");
      return resolve();
    }

    return resolve();
  }).then(() => {
    return listArtifacts(artifactUrl, branch).then(allArtifacts => {
      if (allArtifacts.length === 0) {
        console.log("No artifacts found");
        return;
      }

      const recordsArtifact = allArtifacts.find(artifact => {
        return artifact.path.includes("records.json");
      });

      if (!recordsArtifact) {
        console.log("No records artifact found");
        return;
      }

      return getLatestArtifact(recordsArtifact);
    });
  });
}

function getLatestArtifact(artifact) {
  return http({
    url: artifact.url
  });
}

function http(options) {
  return new Promise((resolve, reject) => {
    options.qs = Object.assign({}, options.qs, {
      "circle-token": process.env.CIRCLE_TOKEN
    });

    request(options, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        return reject(err || res.body);
      }

      resolve(body);
    });
  });
}

function listArtifacts(artifactUrl, branch) {
  return http({
    json: true,
    qs: {
      branch,
      filter: "successful"
    },
    url: artifactUrl
  });
}

function writeRecordsFile(records) {
  return new Promise((resolve, reject) => {
    fs.writeFile("./records.json", records, err => {
      if (err) {
        reject(
          new Error(
            `There was an issue writing to the filesystem ${err.message}`
          )
        );
      }

      resolve();
    });
  });
}

retrieveLatestRecords({
  artifactUrl,
  branch
})
  .then(latestRecords => {
    if (!latestRecords) {
      process.exit(0);
    }

    return writeRecordsFile(latestRecords);
  })
  .then(() => {
    console.log("Successfully wrote out records file");
    process.exit(0);
  })
  .catch(err => {
    console.log(
      "There was an error grabbing the latest build artifacts from CIRCLE CI",
      err
    );

    process.exit(1);
  });
