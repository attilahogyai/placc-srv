set default_transaction_isolation="read committed";
show default_transaction_isolation;
create user myplacc with LOGIN password 'my.placc';
alter database myplacc owner to myplacc;
ALTER DEFAULT PRIVILEGES IN SCHEMA myplacc GRANT SELECT, INSERT, UPDATE, DELETE ON tables TO myplacc;
ALTER DEFAULT PRIVILEGES IN SCHEMA myplacc GRANT SELECT, USAGE ON sequences TO myplacc;
GRANT SELECT, INSERT, UPDATE, delete ON ALL TABLES IN SCHEMA myplacc to myplacc;
GRANT SELECT, USAGE ON ALL sequences IN SCHEMA myplacc to myplacc;
grant all on schema myplacc to myplacc;

# login psql -h localhost -U myplacc myplacc

set search_path=myplacc,public

CREATE FUNCTION crypt(text, text) RETURNS text
    LANGUAGE c IMMUTABLE STRICT
    AS '$libdir/pgcrypto', 'pg_crypt';


ALTER FUNCTION crypt(text, text) OWNER TO myplacc;

--
-- Name: encrypt(bytea, bytea, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION encrypt(bytea, bytea, text) RETURNS bytea
    LANGUAGE c IMMUTABLE STRICT
    AS '$libdir/pgcrypto', 'pg_encrypt';


ALTER FUNCTION encrypt(bytea, bytea, text) OWNER TO myplacc;

--
-- Name: encrypt_iv(bytea, bytea, bytea, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION encrypt_iv(bytea, bytea, bytea, text) RETURNS bytea
    LANGUAGE c IMMUTABLE STRICT
    AS '$libdir/pgcrypto', 'pg_encrypt_iv';


ALTER FUNCTION encrypt_iv(bytea, bytea, bytea, text) OWNER TO myplacc;

--
-- Name: gen_salt(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION gen_salt(text) RETURNS text
    LANGUAGE c STRICT
    AS '$libdir/pgcrypto', 'pg_gen_salt';


ALTER FUNCTION gen_salt(text) OWNER TO myplacc;

--
-- Name: gen_salt(text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION gen_salt(text, integer) RETURNS text
    LANGUAGE c STRICT
    AS '$libdir/pgcrypto', 'pg_gen_salt_rounds';


ALTER FUNCTION gen_salt(text, integer) OWNER TO myplacc;
