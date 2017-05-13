-- version 1.0

alter table question add column categories character varying(64)[];


CREATE TABLE subscription (
    id integer NOT NULL,
    session character varying(2048) NOT NULL,
    email character varying(2048),
    useracc integer,
    question integer,
    category character varying(2048),
    create_dt timestamp without time zone DEFAULT now() NOT NULL,
    last_change_dt timestamp without time zone,
    last_notification_sent_dt timestamp with time zone
);


ALTER TABLE qumla.subscription OWNER TO qumla;

--
-- Name: TABLE subscription; Type: COMMENT; Schema: qumla; Owner: xprt
--

COMMENT ON TABLE subscription IS 'notification should be sent for records where last_notification_sent<last-change_date';


--
-- Name: COLUMN subscription.last_change_dt; Type: COMMENT; Schema: qumla; Owner: xprt
--

COMMENT ON COLUMN subscription.last_change_dt IS 'last change date on object which is the target of subscription';


--
-- Name: COLUMN subscription.last_notification_sent_dt; Type: COMMENT; Schema: qumla; Owner: xprt
--

COMMENT ON COLUMN subscription.last_notification_sent_dt IS 'last time when notification was sent';


--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: qumla; Owner: xprt
--

CREATE SEQUENCE subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE qumla.subscriptions_id_seq OWNER TO qumla;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: qumla; Owner: xprt
--

ALTER SEQUENCE subscriptions_id_seq OWNED BY subscription.id;


--
-- Name: id; Type: DEFAULT; Schema: qumla; Owner: xprt
--

ALTER TABLE ONLY subscription ALTER COLUMN id SET DEFAULT nextval('subscriptions_id_seq'::regclass);


--
-- Name: subscriptions_pkey; Type: CONSTRAINT; Schema: qumla; Owner: xprt; Tablespace: 
--

ALTER TABLE ONLY subscription
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: uq_subscription; Type: CONSTRAINT; Schema: qumla; Owner: xprt; Tablespace: 
--

ALTER TABLE ONLY subscription
    ADD CONSTRAINT uq_subscription UNIQUE (email, question);


--
-- Name: uq_subscription_useracc; Type: CONSTRAINT; Schema: qumla; Owner: xprt; Tablespace: 
--

ALTER TABLE ONLY subscription
    ADD CONSTRAINT uq_subscription_useracc UNIQUE (question, useracc);


GRANT ALL ON TABLE subscription TO qumla;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE subscription TO qumla;


-- version 1.1

alter table country add region character varying(32) DEFAULT 'world'::character varying NOT NULL
COMMENT ON COLUMN country.region IS 'google region flag';

alter table question add dashboard integer DEFAULT 0 NOT NULL;
COMMENT ON COLUMN question.dashboard IS '0 - default, 1 - advanced';

update country set region = '150' where code in ('GG','JE','AX','DK','EE','FI','FO','GB','IE','IM','IS','LT','LV','NO','SE','SJ','AT','BE','CH','DE','DD','FR','FX','LI','LU','MC','NL','BG','BY','CZ','HU','MD','PL','RO','RU','SU','SK','UA','AD','AL','BA','ES','GI','GR','HR','IT','ME','MK','MT','CS','RS','PT','SI','SM','VA','YU')