import * as fs from "fs";
const CURR_DIR = process.cwd();

const createBoilerplate = (templatePath, newProjectPath) => {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = `${templatePath}/${file}`;
    const isImage = /\.(png|jpe?g|gif|bmp)$/i.test(origFilePath);
    let contents;
    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      if (!isImage) {
        contents = fs.readFileSync(origFilePath, "utf8");
      } else {
        contents = fs.readFileSync(origFilePath, "base64");
      }
      // Rename
      if (file === ".npmignore") file = ".gitignore";

      const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
      if (!isImage) {
        fs.writeFileSync(writePath, contents, "utf8");
      } else {
        fs.writeFileSync(writePath, contents, "base64");
      }
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

      // recursive call
      createBoilerplate(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
};

export default createBoilerplate;
