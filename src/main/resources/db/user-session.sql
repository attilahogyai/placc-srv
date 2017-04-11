-- Table: myplacc.useracc

-- DROP TABLE myplacc.useracc;

CREATE TABLE myplacc.useracc
(
  login character varying(64),
  name character varying(64),
  email character varying(255) NOT NULL,
  id serial NOT NULL,
  password character varying(255),
  status integer DEFAULT 0,
  private_code character varying(1024),
  modify_dt timestamp without time zone DEFAULT now(),
  last_login timestamp without time zone,
  gender integer DEFAULT 0, -- 1 - male...
  provider integer NOT NULL DEFAULT 0, -- - 0 - own...
  newsletter integer,
  language character varying(3),
  scopes character varying(255)[],
  create_dt time with time zone DEFAULT now(),
  image boolean,
  address_list integer[],
  pw_change_request character varying(64),
  phone character varying(32),
  imagec smallint,
  hash character varying(1024), -- not used
  facebook_refresh_token character varying(1024),
  facebook_access_token character varying(1024),
  google_refresh_token character varying(1024),
  google_access_token character varying(1024),
  CONSTRAINT pk_useracc PRIMARY KEY (id),
  CONSTRAINT uq_email UNIQUE (email),
  CONSTRAINT uq_login UNIQUE (login)
)
WITH (
  OIDS=TRUE
);
ALTER TABLE myplacc.useracc
  OWNER TO xprt;
GRANT ALL ON TABLE myplacc.useracc TO myplacc;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE myplacc.useracc TO myplacc;
COMMENT ON TABLE myplacc.useracc
  IS '- hash -not used ';
COMMENT ON COLUMN myplacc.useracc.gender IS '1 - male
2 - female';
COMMENT ON COLUMN myplacc.useracc.provider IS '- 0 - own
- 1 - google';
COMMENT ON COLUMN myplacc.useracc.hash IS 'not used';




-- Table: myplacc.session

-- DROP TABLE myplacc.session;

CREATE TABLE myplacc.session
(
  useracc integer,
  scopes character varying(64)[] NOT NULL,
  code character varying(2048) NOT NULL,
  valid smallint NOT NULL,
  remote_ip character varying(255),
  user_agent character varying(1024),
  expire_date timestamp without time zone,
  create_dt timestamp with time zone DEFAULT now(),
  language character varying(5),
  last_ping timestamp without time zone,
  country character(2),
  location integer,
  remote_host character varying(1024),
  fingerprint character varying(1024),
  hash character varying(1024),
  city character varying(1024),
  lon numeric(18,15),
  lat numeric(18,15),
  CONSTRAINT pk_session PRIMARY KEY (code),
  CONSTRAINT fk_session_useracc FOREIGN KEY (useracc)
      REFERENCES myplacc.useracc (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
GRANT ALL ON TABLE myplacc.session TO myplacc;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE myplacc.session TO myplacc;
