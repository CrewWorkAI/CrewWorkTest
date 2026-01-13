-- Materialized view for top daily/weekly leaderboard queries
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Daily leaderboard top 10
DROP MATERIALIZED VIEW IF EXISTS mv_daily_leaderboard;
CREATE MATERIALIZED VIEW mv_daily_leaderboard AS
SELECT date,
       user_id,
       points,
       RANK() OVER (PARTITION BY date ORDER BY points DESC, user_id) AS rank
FROM daily_points;

-- Weekly leaderboard top 10
DROP MATERIALIZED VIEW IF EXISTS mv_weekly_leaderboard;
CREATE MATERIALIZED VIEW mv_weekly_leaderboard AS
SELECT week_start,
       user_id,
       points,
       RANK() OVER (PARTITION BY week_start ORDER BY points DESC, user_id) AS rank
FROM weekly_points;

-- Refresh trigger for when points tables are updated
CREATE OR REPLACE FUNCTION refresh_leaderboard_views() RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_leaderboard;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weekly_leaderboard;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_daily_points_refresh ON daily_points;
CREATE TRIGGER trg_daily_points_refresh AFTER INSERT OR UPDATE OR DELETE ON daily_points
FOR EACH STATEMENT EXECUTE FUNCTION refresh_leaderboard_views();

DROP TRIGGER IF EXISTS trg_weekly_points_refresh ON weekly_points;
CREATE TRIGGER trg_weekly_points_refresh AFTER INSERT OR UPDATE OR DELETE ON weekly_points
FOR EACH STATEMENT EXECUTE FUNCTION refresh_leaderboard_views();
