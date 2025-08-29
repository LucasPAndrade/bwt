import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

const REQUIRED_FIELDS = ["username", "email", "password"];

function normalizeUserData(userInputValues) {
  const normalizedEmail = normalizeEmail(userInputValues.email);
  const normalizedUsername = normalizeUsername(userInputValues.username);

  return {
    ...userInputValues,
    username_normalized: normalizedUsername,
    email_normalized: normalizedEmail,
  };
}

async function create(userInputValues) {
  // --- Flow Management ---
  // Orchestrates the overall process for creating a new user
  const normalizedUser = normalizeUserData(userInputValues);
  await validate(normalizedUser);

  const newUser = await runInsertQuery(normalizedUser);
  return newUser;

  // --- Implementation Details ---
  // Handles the underlying implementation details
  // async function validateUniqueEmail(email) {}

  async function runInsertQuery(user) {
    const results = await database.query({
      text: `
      INSERT INTO 
        users (username, username_normalized, email, email_normalized, password)
      VALUES
          ($1, $2, $3, $4, $5)
      RETURNING
        *
        `,
      values: [
        user.username,
        user.username_normalized,
        user.email,
        user.email_normalized,
        user.password,
      ],
    });

    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const normalizedUsername = normalizeUsername(username);
  const userFound = await runSelectQuery(normalizedUsername);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          username_normalized = $1
        LIMIT
          1
      ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
      });
    }

    return results.rows[0];
  }
}

async function validate(normalizedUser) {
  // --- Validação técnica ---
  // Verificação de campos vazios ou nulos

  const missingFields = REQUIRED_FIELDS.filter(
    (field) =>
      normalizedUser[field] === undefined || normalizedUser[field] === "",
  );

  if (missingFields.length > 0) {
    const details = missingFields.reduce((acc, field) => {
      acc[field] = `O campo ${field} é obrigatório.`;
      return acc;
    }, {});

    throw new ValidationError({
      message: "Validação de dados de entrada falhou devido a dados ausentes.",
      details: details,
    });
  }

  // --- Validação de regras de negócio ---
  // E-mail duplicado
  const existingEmail = await database.query({
    text: "SELECT email_normalized FROM users WHERE email_normalized = $1",
    values: [normalizedUser.email_normalized],
  });

  if (existingEmail.rowCount > 0) {
    throw new ValidationError({
      message: "O e-mail informado já está sendo utilizado.",
      action: "Utilize outro e-mail para realizar o cadastro.",
    });
  }

  // Username duplicado
  const existingUser = await database.query({
    text: "SELECT username_normalized FROM users WHERE username_normalized = $1",
    values: [normalizedUser.username_normalized],
  });

  if (existingUser.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar o cadastro.",
    });
  }
}

function normalizeEmail(email) {
  if (!email) {
    return email;
  }
  const [localPart, domain] = email.split("@");
  const normalizedLocalPart = localPart
    .replace(/\./g, "")
    .split("+")[0]
    .toLowerCase();
  const normalizedDomain = domain.toLowerCase();

  return `${normalizedLocalPart}@${normalizedDomain}`;
}

function normalizeUsername(username) {
  if (!username) {
    return username;
  }
  const normalizedUsername = username.toLowerCase();
  return normalizedUsername;
}

const user = {
  create,
  findOneByUsername,
};

export default user;
