// Importing necessary modules
const core = require("@actions/core");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Getting the path to the workspace from environment variables
const workspacePath = process.env.GITHUB_WORKSPACE;

// Getting inputs from the workflow
const options = core.getInput("options");
const scriptPath = core.getInput("path");

// Importing the child_process module for executing shell commands
const exec = require("child_process").exec;

// Initializing error variables
let repoError;
let platformError;

// Checking if the platform is Windows
if (process.platform === "win32") {
  // Checking if the GitHub workspace exists and is not empty
  if (
    fs.existsSync(process.env.GITHUB_WORKSPACE) &&
    fs.readdirSync(workspacePath).length > 0
  ) {
    // Setting the download URL of the BAT to EXE converter so we can make it into a writable stream
    const url = "https://raw.githubusercontent.com/Makazzz/BatToExePortable/refs/heads/master/BatToExePortable/BatToExePortable.exe";
    
    // Setting and getting the temporary directory for the runner, used to store the Bat to Exe converter in
    const tempDir = process.env.RUNNER_TEMP;

    // Setting the path to download the Bat to Exe converter to
    const downloadPath = path.join(tempDir, "\\battoexe.exe");

    // Downloading the BAT to EXE converter
    https.get(url, (res) => {
    	const fileStream = fs.createWriteStream(downloadPath);
    	res.pipe(fileStream);
    	
    	fileStream.on('finish', () => {
        	fileStream.close();
        	console.log(`Downloaded BAT to EXE converter to ${downloadPath}`);
    	});
    
    // Building and executing the Inno Setup compiler command
    exec(
      `"${downloadPath}" ${options} "${workspacePath}\\${scriptPath}"`,
      { stdio: "ignore" },
      function (execError, stdout, stderr) {
        // Logging the standard output of the command
        console.log(stdout);

        // Handling errors, if any
        if (execError) {
          repoError = { code: execError.code || 1 };
          core.setFailed(stderr);
          process.exit(repoError.code);
        }
      },
    );
  } else {
    // Setting an error code and failing the workflow if the repository is not cloned
    repoError = { code: 1 };
    core.setFailed(
      "The repository was not cloned. Please specify the actions/checkout action before this step.",
    );
    process.exit(repoError.code);
  }
} else {
  // Setting an error code and failing the workflow if the platform is not Windows
  platformError = { code: 1 };
  core.setFailed("This action is only supported on Windows!");
  process.exit(platformError.code);
}
