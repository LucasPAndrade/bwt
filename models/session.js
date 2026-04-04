import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 Days

function calculateExpiresAtDate() {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  return expiresAt;
}

async function findOneValidByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);
  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
        SELECT 
          *
        FROM
          sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT
          1
      ;`,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function renew(sessionId) {
  // --- Flow management ---
  const expiresAt = calculateExpiresAtDate();
  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);

  return renewedSessionObject;

  // --- Implementation details
  async function runUpdateQuery(sessionId, expiresAt) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *;
        `,
      values: [sessionId, expiresAt],
    });

    return results.rows[0];
  }
}

async function expireById(sessionId) {
  // --- Flow management ---
  const expiresAt = new Date(Date.now() - EXPIRATION_IN_MILLISECONDS - 1000);

  const expiredSessionObject = await runUpdateQuery(sessionId, expiresAt);

  return expiredSessionObject;

  // --- Implementation details
  async function runUpdateQuery(sessionId, expiresAt_query) {
    const results = await database.query({
      text: `
        UPDATE
          sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING
          *;
        `,
      values: [sessionId, expiresAt_query],
    });

    return results.rows[0];
  }
  //Alternative to expires_at: NOW() - interval '1 year'
}

async function create(userId) {
  // --- Flow Management ---
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = calculateExpiresAtDate();

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  // --- Implementation Details ---
  // Handles the underlying implementation details
  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  renew,
  expireById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
