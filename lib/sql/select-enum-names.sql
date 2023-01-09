SELECT
    t.typname AS enum_name,
    string_agg(e.enumlabel, ', ') AS enum_value
FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = { schema }
GROUP BY enum_name;