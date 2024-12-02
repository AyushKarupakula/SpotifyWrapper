
#!/bin/bash

# Loop through all files recursively
find . -type f | while read -r file; do
    (echo ""; cat "$file") > temp_file && mv temp_file "$file"
    echo "Added a new line to $file"
done

echo "Operation completed for all files."
