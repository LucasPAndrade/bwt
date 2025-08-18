exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    //Using Github as reference to limit usernames to 39 characters
    username: {
      type: "varchar(39)",
      notNull: true,
      unique: true,
    },

    username_normalized: {
      type: "varchar(39)",
      notNull: true,
      unique: true,
    },

    // Email limited to 254 characters, see https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    email_normalized: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },

    //Why 72 in length? https://security.stackexchange.com/q/39849
    password: {
      type: "varchar(72)",
      notNull: true,
    },

    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    updated_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });
};

exports.down = false;
