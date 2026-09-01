import { authSwagger, moviesSwagger, userSwagger } from "../utils/yamlParser.js"

import swaggerJsDoc from "swagger-jsdoc";

export const createSwaggerDocs = (url) => {
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
                schemas: {
                    ...moviesSwagger.components.schemas,
                    ...userSwagger.components.schemas,
                },


            },
            paths: {
                ...moviesSwagger.paths,
                ...authSwagger.paths,
                ...userSwagger.paths,
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

