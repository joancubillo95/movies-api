import YAML from "yaml";
import fs from "fs";

const moviesSwagger = YAML.parse(
    fs.readFileSync(
        new URL("../swagger/movies.swagger.yaml", import.meta.url),
        "utf8"
    )
);

const authSwagger = YAML.parse(
    fs.readFileSync(
        new URL("../swagger/auth.swagger.yaml", import.meta.url),
        "utf8"
    )
);

const userSwagger = YAML.parse(
    fs.readFileSync(
        new URL("../swagger/users.swagger.yaml", import.meta.url),
        "utf8"
    )
);

export { moviesSwagger, authSwagger, userSwagger }