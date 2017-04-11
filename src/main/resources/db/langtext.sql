-- Table: qumla.langtext

-- DROP TABLE qumla.langtext;

CREATE TABLE myplacc.langtext
(
  id serial NOT NULL,
  type character varying(255) NOT NULL,
  code character varying(255) NOT NULL,
  language character varying(3) NOT NULL,
  text character varying NOT NULL,
  server smallint,
  CONSTRAINT pk_langtext PRIMARY KEY (id),
  CONSTRAINT langtext_type_code_language_key UNIQUE (type, code, language)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE myplacc.langtext
  OWNER TO myplacc;
GRANT ALL ON TABLE myplacc.langtext TO myplacc;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE myplacc.langtext TO myplacc;