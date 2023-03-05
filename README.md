# Bat-To-Exe-Action
GitHub action to convert .bat files to .exe
# Example usage
name: Create a .exe file
on:
  push:
  pull_request:
  workflow_dispatch:
jobs:
 create_iso:
   runs-on: windows-latest
   steps:
    - name: Create .EXE file from batch
      uses: Minionguyjpro/Create-Disk-Image@v1
      with:
        src: file.bat
        exe: outputfile.exe
# Settings
| **Key name** | **Required** | **Example** | **Default Value** | **Description                             |
|--------------|--------------|-------------|-------------------|-------------------------------------------|
| ``src``      | Yes          | example.bat | N/A               | The source batch file for the compilation |
| ``exe``      | Yes          | example.exe | bat.exe           | The .exe file to be compiled              |
