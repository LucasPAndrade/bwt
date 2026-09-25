exports.up = (pgm) => {
  pgm.createTable("user_activation_tokens", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // used: {
    //   type: 'boolean',
    //   notNull: true,
    //   default: false
    // },

    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    used_at: {
      type: "timestamptz",
      notNull: false,
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    // Why use timestamp with time zone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    expires_at: {
      type: "timestamptz",
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
