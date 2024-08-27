# CSVQL Syntax Documentation

## Overview

CSVQL is a custom query language designed to allow users to write SQL-like queries to interact with CSV files. This syntax documentation provides detailed descriptions of the commands and expressions that can be used in CSVQL.

## Syntax Structure

### 1. IMPORT Statement

The `IMPORT` statement is used to load a CSV file into the query context. This is the first command that must be executed in any CSVQL script.

#### Syntax:

```sql
IMPORT [variable_name] FROM '[file_path]'
```

#### Parameters:

- **`variable_name`**: The name of the variable that will reference the loaded CSV file.
- **`file_path`**: The path to the CSV file (relative or absolute).

#### Example:

```sql
IMPORT file FROM 'files/machine-readable-business-employment-data-mar-2024-quarter.csv'
```

In this example, the file `machine-readable-business-employment-data-mar-2024-quarter.csv` is loaded and referenced as `file`.

### 2. SELECT Statement

The `SELECT` statement is used to retrieve data from the CSV file. You can select all columns or specific columns from the file. The `SELECT` statement can optionally include a `WHERE` clause to filter rows.

#### Syntax:

```sql
SELECT [columns] FROM [variable_name] [WHERE condition]
```

#### Parameters:

- **`columns`**: The columns you want to select. Use `*` to select all columns.
- **`variable_name`**: The name of the variable that references the imported CSV file.
- **`WHERE condition`** (Optional): A condition to filter rows based on column values.

#### Example 1: Select All Columns

```sql
SELECT * FROM file
```

This query selects all columns from the `file`.

#### Example 2: Select Specific Column

```sql
SELECT Data_value FROM file
```

This query selects the `Data_value` column from the `file`.

### 3. WHERE Clause

The `WHERE` clause is used to filter the rows returned by the `SELECT` statement. The clause specifies a condition that each row must meet to be included in the result.

#### Syntax:

```sql
WHERE [column] [operator] [value]
```

#### Parameters:

- **`column`**: The name of the column to filter on.
- **`operator`**: The comparison operator (e.g., `=`, `!=`, `<`, `>`, `<=`, `>=`).
- **`value`**: The value to compare the column against. This can be a string, number, or boolean value.

#### Supported Operators:

- **`=`**: Equal to.
- **`!=`**: Not equal to.
- **`<`**: Less than.
- **`>`**: Greater than.
- **`<=`**: Less than or equal to.
- **`>=`**: Greater than or equal to.
- **`AND`**: Logical AND (converted to `&&` in JavaScript).
- **`OR`**: Logical OR (converted to `||` in JavaScript).

#### Example:

```sql
SELECT * FROM file WHERE Data_value = '80078' AND Period = '2011.06'
```

This query selects all columns from `file` where the `Data_value` column equals `'80078'` and the `Period` column equals `'2011.06'`.

### 4. Logical Operators (AND, OR)

Currently, the syntax supports basic logical operators like `AND` and `OR` in the `WHERE` clause to combine multiple conditions.

#### Syntax:

```sql
WHERE [condition1] AND/OR [condition2]
```

#### Example:

```sql
SELECT * FROM file WHERE Data_value = '80078' AND Year = '2024'
```

This query selects all columns from `file` where the `Data_value` is `'80078'` **and** the `Year` is `'2024'`.

### 5. Parentheses for Grouping

You can use parentheses in the `WHERE` clause to group conditions and control the order of evaluation.

#### Syntax:

```sql
WHERE ([condition1] AND [condition2]) OR [condition3]
```

#### Example:

```sql
SELECT * FROM file WHERE (Data_value = '80078' AND Year = '2024') OR Region = 'North'
```

This query selects all columns from `file` where the `Data_value` is `'80078'` and the `Year` is `'2024'`, **or** the `Region` is `'North'`.

## Complete Example

Here's a complete example of a CSVQL script:

```sql
IMPORT file FROM 'files/machine-readable-business-employment-data-mar-2024-quarter.csv'
SELECT * FROM file WHERE Data_value = '80078' AND Year = '2024'
```

### Explanation:

- **IMPORT**: Loads the CSV file into the `file` variable.
- **SELECT**: Retrieves all columns from the `file`.
- **WHERE**: Filters the rows to only include those where `Data_value` equals `'80078'` and `Year` equals `'2024'`.

## Error Handling

### Common Errors:

- **Syntax Error**: Ensure that the syntax follows the correct format. For example, missing quotation marks around the file path or incorrect use of operators can cause syntax errors.
- **Unsupported Operators**: Ensure that you are using supported comparison operators in the `WHERE` clause.
- **Unknown Variable**: Make sure that the variable name in the `SELECT` statement matches the name defined in the `IMPORT` statement.

### Example Error:

```sql
Error: Unsupported condition node type: WHERE_CLAUSE
```

This error indicates that the parser encountered an unsupported or incorrectly structured condition in the `WHERE` clause. Check the syntax and ensure that the condition is valid.

## Extending CSVQL

If you want to extend CSVQL to support more features, such as additional SQL-like commands (`JOIN`, `ORDER BY`, etc.), you can modify the parser to include new AST node types and extend the code generation logic accordingly.
