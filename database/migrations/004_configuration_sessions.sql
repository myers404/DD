-- Configuration Sessions Table
-- Stores session-based configuration state with MTBDD snapshots

CREATE TABLE IF NOT EXISTS configuration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(255) NOT NULL,
    model_version INTEGER NOT NULL DEFAULT 1,
    
    -- MTBDD snapshot (compressed binary)
    mtbdd_snapshot BYTEA NOT NULL,
    
    -- Current configuration state
    selections JSONB NOT NULL DEFAULT '{}',
    validation_state JSONB DEFAULT NULL,
    pricing_state JSONB DEFAULT NULL,
    
    -- User and session management
    user_id VARCHAR(255),
    session_token VARCHAR(255) UNIQUE,
    
    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'completed', 'abandoned')),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    accessed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON configuration_sessions(user_id);
CREATE INDEX idx_sessions_model_id ON configuration_sessions(model_id);
CREATE INDEX idx_sessions_status ON configuration_sessions(status);
CREATE INDEX idx_sessions_expires_at ON configuration_sessions(expires_at);
CREATE INDEX idx_sessions_token ON configuration_sessions(session_token);
CREATE INDEX idx_sessions_accessed ON configuration_sessions(accessed_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.accessed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
CREATE TRIGGER update_session_timestamp_trigger
BEFORE UPDATE ON configuration_sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_timestamp();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM configuration_sessions
    WHERE expires_at < NOW()
    AND status != 'completed';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Session history table for audit trail
CREATE TABLE IF NOT EXISTS configuration_session_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    selections_before JSONB,
    selections_after JSONB,
    validation_state JSONB,
    pricing_state JSONB,
    user_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (session_id) REFERENCES configuration_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_session_history_session_id ON configuration_session_history(session_id);
CREATE INDEX idx_session_history_created_at ON configuration_session_history(created_at);

-- Function to log session changes
CREATE OR REPLACE FUNCTION log_session_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.selections IS DISTINCT FROM NEW.selections THEN
        INSERT INTO configuration_session_history (
            session_id,
            action,
            selections_before,
            selections_after,
            validation_state,
            pricing_state,
            user_id
        ) VALUES (
            NEW.id,
            'selection_update',
            OLD.selections,
            NEW.selections,
            NEW.validation_state,
            NEW.pricing_state,
            NEW.user_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log selection changes
CREATE TRIGGER log_session_changes_trigger
AFTER UPDATE ON configuration_sessions
FOR EACH ROW
WHEN (OLD.selections IS DISTINCT FROM NEW.selections)
EXECUTE FUNCTION log_session_change();

-- View for active sessions
CREATE VIEW active_configuration_sessions AS
SELECT 
    cs.id,
    cs.model_id,
    cs.user_id,
    cs.status,
    cs.created_at,
    cs.accessed_at,
    cs.expires_at,
    jsonb_array_length(COALESCE(cs.selections->'selections', '[]'::jsonb)) as selection_count,
    cs.validation_state->>'is_valid' as is_valid,
    cs.pricing_state->>'total_price' as total_price
FROM configuration_sessions cs
WHERE cs.expires_at > NOW()
AND cs.status NOT IN ('abandoned', 'completed');

-- Function to extend session expiry
CREATE OR REPLACE FUNCTION extend_session_expiry(p_session_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TIMESTAMP AS $$
DECLARE
    new_expiry TIMESTAMP;
BEGIN
    UPDATE configuration_sessions
    SET expires_at = NOW() + (p_days || ' days')::INTERVAL,
        accessed_at = NOW()
    WHERE id = p_session_id
    RETURNING expires_at INTO new_expiry;
    
    RETURN new_expiry;
END;
$$ LANGUAGE plpgsql;

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_statistics()
RETURNS TABLE (
    total_sessions BIGINT,
    active_sessions BIGINT,
    draft_sessions BIGINT,
    validated_sessions BIGINT,
    completed_sessions BIGINT,
    abandoned_sessions BIGINT,
    avg_session_duration INTERVAL,
    avg_selections_per_session NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_sessions,
        COUNT(*) FILTER (WHERE status = 'draft' AND expires_at > NOW())::BIGINT as active_sessions,
        COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_sessions,
        COUNT(*) FILTER (WHERE status = 'validated')::BIGINT as validated_sessions,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_sessions,
        COUNT(*) FILTER (WHERE status = 'abandoned')::BIGINT as abandoned_sessions,
        AVG(CASE 
            WHEN status = 'completed' THEN updated_at - created_at 
            ELSE NULL 
        END) as avg_session_duration,
        AVG(jsonb_array_length(COALESCE(selections->'selections', '[]'::jsonb)))::NUMERIC as avg_selections_per_session
    FROM configuration_sessions;
END;
$$ LANGUAGE plpgsql;