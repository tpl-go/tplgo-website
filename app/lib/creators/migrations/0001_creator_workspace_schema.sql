CREATE SCHEMA IF NOT EXISTS creator;

CREATE TABLE IF NOT EXISTS creator.creator_profiles (
  id text PRIMARY KEY,
  user_id text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  avatar_reference text,
  cover_reference text,
  creator_type text NOT NULL DEFAULT 'individual',
  categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  location jsonb NOT NULL DEFAULT '{}'::jsonb,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  portfolio_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  verification_status text NOT NULL DEFAULT 'not_verified',
  support_policy text,
  copyright_declaration text,
  ai_policy_acknowledged boolean NOT NULL DEFAULT false,
  profile_status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creator.creator_onboarding_submissions (
  id text PRIMARY KEY,
  creator_profile_id text NOT NULL REFERENCES creator.creator_profiles(id),
  user_id text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  current_step integer NOT NULL DEFAULT 1,
  identity_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  profile_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  expertise_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  portfolio_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  tax_readiness jsonb NOT NULL DEFAULT '{}'::jsonb,
  payout_readiness jsonb NOT NULL DEFAULT '{}'::jsonb,
  agreements jsonb NOT NULL DEFAULT '{}'::jsonb,
  copyright_declaration jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_policy_acknowledgement jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  changes_requested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creator.creator_asset_drafts (
  id text PRIMARY KEY,
  creator_profile_id text NOT NULL REFERENCES creator.creator_profiles(id),
  user_id text NOT NULL,
  slug text NOT NULL,
  asset_type text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  subcategory text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  preview_media_metadata jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_file_metadata jsonb NOT NULL DEFAULT '[]'::jsonb,
  technical_specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  supported_licenses jsonb NOT NULL DEFAULT '[]'::jsonb,
  pricing_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  copyright_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  release_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_generated_disclosure jsonb NOT NULL DEFAULT '{}'::jsonb,
  support_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  version_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  moderation_status text NOT NULL DEFAULT 'not_submitted',
  publish_status text NOT NULL DEFAULT 'unpublished',
  draft_status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  UNIQUE (creator_profile_id, slug)
);

CREATE TABLE IF NOT EXISTS creator.creator_asset_metadata (
  asset_draft_id text PRIMARY KEY REFERENCES creator.creator_asset_drafts(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creator.creator_collections (
  id text PRIMARY KEY,
  creator_profile_id text NOT NULL REFERENCES creator.creator_profiles(id),
  user_id text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_reference text,
  visibility text NOT NULL DEFAULT 'private',
  featured_preview boolean NOT NULL DEFAULT false,
  bundle_readiness boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (creator_profile_id, slug)
);

CREATE TABLE IF NOT EXISTS creator.creator_collection_items (
  collection_id text NOT NULL REFERENCES creator.creator_collections(id),
  asset_draft_id text NOT NULL REFERENCES creator.creator_asset_drafts(id),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, asset_draft_id)
);

CREATE TABLE IF NOT EXISTS creator.creator_asset_versions (
  id text PRIMARY KEY,
  asset_draft_id text NOT NULL REFERENCES creator.creator_asset_drafts(id),
  creator_profile_id text NOT NULL REFERENCES creator.creator_profiles(id),
  semantic_version text NOT NULL,
  changelog jsonb NOT NULL DEFAULT '[]'::jsonb,
  release_notes text NOT NULL DEFAULT '',
  file_set_metadata jsonb NOT NULL DEFAULT '[]'::jsonb,
  compatibility jsonb NOT NULL DEFAULT '[]'::jsonb,
  buyer_access_policy text NOT NULL DEFAULT 'purchased_version_only',
  support_window text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);

CREATE TABLE IF NOT EXISTS creator.creator_upload_sessions (
  id text PRIMARY KEY,
  creator_profile_id text NOT NULL REFERENCES creator.creator_profiles(id),
  user_id text NOT NULL,
  asset_draft_id text REFERENCES creator.creator_asset_drafts(id),
  upload_type text NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  checksum_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_name text NOT NULL DEFAULT 'metadata_only',
  session_status text NOT NULL DEFAULT 'created',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS creator.creator_activity_events (
  id text PRIMARY KEY,
  creator_profile_id text NOT NULL REFERENCES creator.creator_profiles(id),
  user_id text NOT NULL,
  event_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creator.creator_idempotency_keys (
  key text PRIMARY KEY,
  user_id text NOT NULL,
  operation text NOT NULL,
  request_hash text NOT NULL,
  response jsonb NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
