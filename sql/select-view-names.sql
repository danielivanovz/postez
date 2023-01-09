SELECT 
	table_name
FROM 
	information_schema."views"
WHERE table_schema = ${ schema } and view_definition notnull 