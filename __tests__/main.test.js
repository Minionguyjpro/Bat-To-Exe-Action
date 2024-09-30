// Importing the script and setting up mocks
const core = require('@actions/core');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Mocking environment variables
process.env.GITHUB_WORKSPACE = '/mocked/workspace';
process.env.RUNNER_TEMP = '/mocked/temp';
process.platform = 'win32'; // Simulate Windows platform

jest.mock('@actions/core');
jest.mock('https');
jest.mock('fs');
jest.mock('child_process');
jest.mock('path');

// Test Suite
describe('GitHub Action Script', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should exit with failure if not on Windows', () => {
    // Mock platform to non-Windows
    process.platform = 'linux';

    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});

    require('./script'); // Require the script after setting mocks

    expect(core.setFailed).toHaveBeenCalledWith("This action is only supported on Windows!");
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('should exit with failure if repository is not cloned', () => {
    // Mock the platform and fs checks
    process.platform = 'win32';
    fs.existsSync.mockReturnValue(false); // Mock repository not cloned

    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});

    require('./script');

    expect(core.setFailed).toHaveBeenCalledWith("The repository was not cloned. Please specify the actions/checkout action before this step.");
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('should download BAT to EXE converter and execute the command successfully', done => {
    // Mock the platform and fs checks
    process.platform = 'win32';
    fs.existsSync.mockReturnValue(true); // Repo exists
    fs.readdirSync.mockReturnValue([ 'file1.bat' ]); // Workspace not empty

    // Mock the download process
    const fileStream = { pipe: jest.fn(), on: jest.fn((event, callback) => callback()) }; // Mock stream events
    const response = { pipe: jest.fn() };
    https.get.mockImplementation((url, callback) => {
      callback(response);
      return fileStream;
    });

    // Mock path and child_process.exec behavior
    path.join.mockImplementation((dir, file) => `${dir}/${file}`);
    exec.mockImplementation((cmd, options, callback) => {
      callback(null, 'Success', null); // Simulate success
    });

    // Run the script and assert behavior
    require('./script');

    // Assert the download URL and process
    expect(https.get).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/Makazzz/BatToExePortable/refs/heads/master/BatToExePortable/BatToExePortable.exe",
      expect.any(Function)
    );
    
    // Check that the command is executed with correct parameters
    expect(exec).toHaveBeenCalledWith(
      '"/mocked/temp/battoexe.exe" undefined "/mocked/workspace/undefined"',
      { stdio: 'ignore' },
      expect.any(Function)
    );
    done();
  });

  test('should fail if exec command returns an error', done => {
    // Mock platform and fs checks
    process.platform = 'win32';
    fs.existsSync.mockReturnValue(true); // Repo exists
    fs.readdirSync.mockReturnValue([ 'file1.bat' ]); // Workspace not empty

    // Mock the download process
    const fileStream = { pipe: jest.fn(), on: jest.fn((event, callback) => callback()) };
    const response = { pipe: jest.fn() };
    https.get.mockImplementation((url, callback) => {
      callback(response);
      return fileStream;
    });

    // Mock path and simulate error in exec command
    path.join.mockImplementation((dir, file) => `${dir}/${file}`);
    exec.mockImplementation((cmd, options, callback) => {
      callback(new Error('Execution error'), null, 'Error occurred');
    });

    // Spy on process exit
    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Run the script
    require('./script');

    // Assert that the error is handled correctly
    expect(core.setFailed).toHaveBeenCalledWith('Error occurred');
    expect(exitMock).toHaveBeenCalledWith(1);

    done();
  });
});

