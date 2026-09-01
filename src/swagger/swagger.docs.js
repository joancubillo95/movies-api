import YAML from "yaml";
import fs from "fs";
import swaggerJsDoc from "swagger-jsdoc";

export const createSwaggerDocs = (url) => {

    const moviesSwagger = YAML.parse(
        fs.readFileSync(
            new URL("./movies.swagger.yaml", import.meta.url),
            "utf8"
        )
    );

    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'Movies API',
                version: "0.3.2",
                description: 'API documentation',
            },
            servers: [
                {
                    url: url,
                },
            ],
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "api-key"
                    }
                },
                ...moviesSwagger.components,
            },
            paths: {
                ...moviesSwagger.paths,
            },
            security: [
                {
                    ApiKeyAuth: [],
                },
            ],
        },
        apis: [], // files containing annotations as above
    }

    return swaggerJsDoc(swaggerOptions);
}

