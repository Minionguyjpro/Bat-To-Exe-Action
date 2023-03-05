# Bat to Exe Container
FROM mcr.microsoft.com/windows/servercore:ltsc2019

LABEL "com.github.actions.name"="Bat to Exe Action"
LABEL "com.github.actions.description"="GitHub action to convert .bat files to .exe"
LABEL maintainer="minionguyjpro@gmail.com"

RUN mkdir "$Env:PROGRAMFILES\Bat To Exe Converter"
RUN curl "https://gsf-fl.softonic.com/67e/676/08af90d870c4a8f8ab91b52d4544e93ca3/Bat_To_Exe_Converter_x64.exe?Expires=1678068497&Signature=ad4abc6155d7501827e7cc6f00f79d954ea58623&url=https://bat-to-exe-converter-x64.en.softonic.com&Filename=Bat_To_Exe_Converter_x64.exe" -o "$Env:PROGRAMFILES\Bat To Exe Converter\Bat_To_Exe.exe" -k

ADD entrypoint.ps1 /entrypoint.ps1
ENTRYPOINT ["pwsh", "/entrypoint.ps1"]