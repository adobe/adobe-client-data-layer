await import('https://cdnjs.cloudflare.com/ajax/libs/ajv/8.12.0/ajv2020.min.js');
import AcdlValidator from '/dist/validator/validator.js';

const validator = new AcdlValidator();

// Define and load all schemas
const schemas = [
    'component',
    'carousel-clicked',
];
(await Promise.all(
    schemas.map(async schema => {
        const response = await fetch(`/examples/js/schema/${schema}.json`);
        return [await response.json(), schema];
    })
)).forEach(([schemaJson, schema]) => validator.addSchema(schemaJson, schema));

// Start validator
validator.start();
