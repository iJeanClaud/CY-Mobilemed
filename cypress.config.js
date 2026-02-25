const { defineConfig } = require("cypress");
const { Client } = require("pg");
const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'mobilemed',
  password: 'mob@teste',
  database: 'mobilemed'
};


module.exports = defineConfig({
  allowCypressEnv: true,

  e2e: {
    specPattern: [
      "cypress/e2e/**/*.cy.{js,ts}",
      "cypress/api/**/*.cy.{js,ts}"
    ],
    setupNodeEvents(on, config) {
    on('task', {

    async insertRandomExam() {
      const client = new Client(dbConfig);

      try {
        await client.connect();

        const result = await client.query(`
          INSERT INTO public.exam
          (id, patientid, modality, idempotencykey, requestedat, createdat, createdby, updatedat, updatedby)
          VALUES(
            gen_random_uuid(),
            (SELECT id FROM public.patient ORDER BY RANDOM() LIMIT 1),
            'US'::public."exam_modality_enum",
            gen_random_uuid()::text,
            NULL,
            NOW(),
            (SELECT id FROM public.usersystem ORDER BY RANDOM() LIMIT 1),
            NOW(),
            NULL
          )
          RETURNING *;
        `);

        return result.rows[0];

      } finally {
        await client.end();
      }
    },

    });
    },
    baseUrl: 'http://localhost:4200',
    env: {
      apiUrl: 'http://localhost:3000'
    }
  },
});
