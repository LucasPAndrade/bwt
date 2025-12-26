exports.up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // Inspired by Facebook
    token: {
      type: "varchar(96)",
      notNull: true,
      unique: true,
    },

    user_id: {
      type: "uuid",
      notNull: true,
      // references: "users", //users.id // relação não declarada para avaliar comportamento
    },

    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    expires_at: {
      type: "timestamptz",
      notNull: true,
    },
    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

exports.down = false;
