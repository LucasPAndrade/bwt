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

    // Why 254 in length? https://stackoverflow.com/a/1199238
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

    //Why 60 in length? https://www.npmjs.com/package/bcrypt#hash-info
    password: {
      type: "varchar(60)",
      notNull: true,
    },

    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
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
