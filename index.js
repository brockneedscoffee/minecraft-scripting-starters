#!/usr/bin/env node
import inquirer from "inquirer";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import chalk from "chalk";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import createBoilerplate from "./createBoilerplate.js";

let projectType;
let bpManifestPath;
let rpMainfestPath;
let newDir;
let projectName;
let projectDescription;
const CURR_DIR = process.cwd();
const __dirname = dirname(fileURLToPath(import.meta.url));

const CHOICES = fs.readdirSync(`${__dirname}/templates`);

const addOnBPUUID = uuidv4();
const addOnRPUUID = uuidv4();
const blankProjectUUID = uuidv4();

const QUESTIONS = [
  {
    name: "project-choice",
    type: "list",
    message: "What project template would you like to generate?",
    choices: CHOICES,
  },
  {
    name: "project-name",
    type: "input",
    message: "Project name:",
    validate: function (input) {
      if (/^([A-Za-z\-\\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    },
  },
  {
    name: "project-description",
    type: "input",
    message: "Project Description",
  },
];

inquirer
  .prompt(QUESTIONS)
  .then((answers) => {
    const projectChoice = answers["project-choice"];
    projectName = answers["project-name"];
    const templatePath = `${__dirname}/templates/${projectChoice}`;
    projectDescription = answers["project-description"];

    fs.mkdirSync(`${CURR_DIR}/${projectName}`);
    newDir = `${CURR_DIR}/${projectName}`;
    bpManifestPath = `${CURR_DIR}/${projectName}`;
    rpMainfestPath = `${CURR_DIR}/${projectName}`;
    createBoilerplate(templatePath, projectName);
    projectType = projectChoice;
  })
  .then(() => {
    let addOnRPMainfest = `{
        "format_version": 2,
        "header": {
          "name": "${projectName}",
          "description": "${projectName} Resource Pack",
          "uuid": "${addOnRPUUID}",
          "version": [1, 0, 0],
          "min_engine_version": [1, 16, 0]
        },
        "modules": [
          {
            "description": "${projectName} Resources",
            "type": "resources",
            "uuid": "${uuidv4()}",
            "version": [1, 0, 0]
          }
        ],
        "dependencies": [
          {
            "uuid": "00a2d14f-cb0b-4e0a-b3bc-25386272fae0",
            "version": [1, 0, 0]
          }
        ]
      }`;
    let addOnBPManifest = `{
        "format_version": 2,
        "header": {
          "name": "${projectName}",
          "description": "${projectName} Behavior Pack",
          "uuid": "${addOnBPUUID}",
          "version": [1, 0, 0],
          "min_engine_version": [1, 16, 0]
        },
        "modules": [
          {
            "description": "Behavior",
            "version": [1, 0, 0],
            "uuid": "${uuidv4()}",
            "type": "data"
          },
          {
            "description": "Script resources",
            "language": "javascript",
            "type": "script",
            "uuid": "${uuidv4()}",
            "version": [0, 0, 1],
            "entry": "scripts/main.js"
          }
        ],
        "dependencies": [
          {
            "uuid": "${addOnRPUUID}",
            "version": [1, 0, 0]
          },
          {
            "module_name": "@minecraft/server",
            "version": "1.6.0"
          },
          {
            "module_name": "@minecraft/server-ui",
            "version": "1.1.0"
          }
        ]
      }`;

    let blankProjectManifest = `
      {
        "format_version": 2,
        "header": {
          "name": "${projectName}",
          "description": "${projectDescription}",
          "uuid": "${blankProjectUUID}",
          "version": [0, 0, 1],
          "min_engine_version": [1, 20, 30]
        },
        "modules": [
          {
            "description": "Script resources",
            "language": "javascript",
            "type": "script",
            "uuid": "${uuidv4()}",
            "version": [0, 0, 1],
            "entry": "scripts/main.js"
          }
        ],
        "dependencies": [
          {
            "module_name": "@minecraft/server",
            "version": "1.5.0"
          }
        ]
      }
      `;

    if (projectType == "add_ons") {
      // create behavior pack mainfest
      try {
        fs.writeFileSync(
          `${bpManifestPath}/behavior_packs/aop_mobsbp/manifest.json`,
          addOnBPManifest
        );
      } catch (err) {
        console.error(err);
      }
      // create resource pack mainfest
      try {
        fs.writeFileSync(
          `${rpMainfestPath}/resource_packs/aop_mobsrp/manifest.json`,
          addOnRPMainfest
        );
      } catch (err) {
        console.error(err);
      }
    } else if (projectType == "custom_blocks") {
      // create behavior pack mainfest
      try {
        fs.writeFileSync(
          `${bpManifestPath}/behavior_packs/custom_block_behavior_pack/manifest.json`,
          addOnBPManifest
        );
      } catch (err) {
        console.error(err);
      }
      // create resource pack mainfest
      try {
        fs.writeFileSync(
          `${rpMainfestPath}/resource_packs/custom_block_resource_pack/manifest.json`,
          addOnRPMainfest
        );
      } catch (err) {
        console.error(err);
      }
    } else if (projectType == "blank_project") {
      // create behavior pack mainfest
      try {
        fs.writeFileSync(
          `${bpManifestPath}/behavior_packs/starterbp/manifest.json`,
          blankProjectManifest
        );
      } catch (err) {
        console.error(err);
      }
    }
  })
  .then(() => {
    console.log(chalk.green("Installing dependencies......."));
    exec(
      `cd ${newDir} && npm i && npm i gulp --global && gulp`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(chalk.yellow(`${stderr}`));
        }
        console.log(chalk.green(`${stdout}`));
        console.log(chalk.green("Project has been created!"));
        console.log(
          chalk.cyan(
            `To get started, in your terminal input cd ${projectName} code .`
          )
        );
      }
    );
  });
