import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { NotFoundError } from "infra/errors.js";
import user from "models/user.js";

const EXPIRATION_TIME_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes
const ACTIVATION_BASE_URL = `${webserver.origin}/cadastro/ativar/`;

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_TIME_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function sendActivationEmail(user, activationToken) {
  await email.send({
    from: "Big Wig Tech <contato@bwt.com.br>",
    to: user.email,
    subject: "Ative seu cadastro",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro:

${ACTIVATION_BASE_URL}${activationToken.id}

Atenciosamente,
Equipe Big Wig Tech
    `,
  });
}

async function findOneValidById(tokenId) {
  const validToken = await runSelectQuery(tokenId);
  return validToken;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      `,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Token de ativação utilizado não foi encontrado ou expirou.",
        action: "Submeta um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [activationTokenId],
    });

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, ["create:session"]);
  return activatedUser;
}

function extractActivationTokenFromEmail(emailText) {
  const activationTokenRegex = new RegExp(
    `${ACTIVATION_BASE_URL}([a-zA-Z0-9-]+)`,
  );
  const match = emailText.match(activationTokenRegex);

  // if (match && match[1]) {
  //   return match[1];
  // }
  return match ? match[1] : null;
}

const activation = {
  create,
  findOneValidById,
  sendActivationEmail,
  extractActivationTokenFromEmail,
  markTokenAsUsed,
  activateUserByUserId,
  ACTIVATION_BASE_URL,
};

export default activation;
