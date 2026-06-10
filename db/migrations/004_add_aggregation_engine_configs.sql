-- Migration: Add aggregation_engine_configs table

CREATE TABLE IF NOT EXISTS public.aggregation_engine_configs (
    modality text PRIMARY KEY,
    min_clients integer NOT NULL,
    max_clients integer NOT NULL,
    ssl_weight numeric NOT NULL,
    acc_weight numeric NOT NULL,
    size_weight numeric NOT NULL,
    p60_percentile integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aggregation_engine_configs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'aggregation_engine_configs_public_select'
    ) THEN
        EXECUTE 'CREATE POLICY aggregation_engine_configs_public_select ON public.aggregation_engine_configs FOR SELECT USING (true);';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'aggregation_engine_configs_public_insert'
    ) THEN
        EXECUTE 'CREATE POLICY aggregation_engine_configs_public_insert ON public.aggregation_engine_configs FOR INSERT WITH CHECK (true);';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy WHERE polname = 'aggregation_engine_configs_public_update'
    ) THEN
        EXECUTE 'CREATE POLICY aggregation_engine_configs_public_update ON public.aggregation_engine_configs FOR UPDATE USING (true) WITH CHECK (true);';
    END IF;
END$$;

CREATE OR REPLACE FUNCTION public.set_aggregation_engine_config_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_aggregation_engine_config_updated_at ON public.aggregation_engine_configs;
CREATE TRIGGER trg_set_aggregation_engine_config_updated_at
BEFORE UPDATE ON public.aggregation_engine_configs
FOR EACH ROW EXECUTE FUNCTION public.set_aggregation_engine_config_updated_at();
