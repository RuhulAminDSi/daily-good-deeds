-- The per-user indexes on user_sessions and verification_tokens become full (not partial) indexes:
-- deleting a user cascades through user_id, which a partial index cannot serve, so account
-- deletion would otherwise scan both tables. They still serve the "your devices" list
-- (F-AUTH-007) and token reissue.

DROP INDEX "user_sessions_user_id_last_used_at_active_idx";
DROP INDEX "verification_tokens_user_id_type_open_idx";

-- ---------------------------------------------------------------- Hand-written

CREATE INDEX "user_sessions_user_id_last_used_at_idx" ON "user_sessions"("user_id", "last_used_at" DESC);
CREATE INDEX "verification_tokens_user_id_type_idx" ON "verification_tokens"("user_id", "type");
