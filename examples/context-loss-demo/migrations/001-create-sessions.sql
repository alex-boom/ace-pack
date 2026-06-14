create table sessions (
  id text primary key,
  user_id text not null,
  access_token_hash text not null,
  expires_at integer not null
);
