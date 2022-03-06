SELECT 
   column_name, 
   udt_name, 
   is_nullable 
FROM 
   information_schema.columns
WHERE 
   table_name = ${table_name} and table_schema = 'public'