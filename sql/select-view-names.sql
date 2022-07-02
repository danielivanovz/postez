SELECT 
	table_name
FROM 
	information_schema."views"
WHERE table_schema = 'public' and view_definition notnull 