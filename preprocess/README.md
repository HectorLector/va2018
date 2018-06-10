Extract data from pdf files and transform
the data in an input format for the Visualizer tool.

Dependencies:

 - pdfimages
 - pdftotext


nodejs, npm:    (Latest LTS Version: 8.11.2 (includes npm 5.6.0))
    - npm install natural



Folder structure:

    - out/
    - in/
    - node/*
    - clean.sh
    - extract.sh
    - transform.sh
    - app.js

Put your pdf files in the "in" directory.
Call "./clean.sh && ./extract.sh && ./transform.sh" to start the process.
There will be a file "visualizer.csv" created, which you can then use
as input for the Visualizer Tool.
    
