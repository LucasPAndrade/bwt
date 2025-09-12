import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";
import migrator from "models/migrator.js";
import user from "models/user.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status != 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function runPendingMigration() {
  await migrator.runPendingMigration();
}

async function createUser(userObject) {
  return await user.create({
    username: userObject.username || faker.internet.username(),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "senha valida",
  });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigration,
  createUser,
};

export default orchestrator;
