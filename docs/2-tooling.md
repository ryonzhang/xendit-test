# 1.Tooling
This short readme will brief the opinionated tooling config

### 1.1 Winston
Info and error will be logged to Console during dev and logged to combined file while only error will be logged to error file. I have restructure the error logging part using middleware to handle the error catching and parsing as a more neat way. Although for the core structure, there are so many things I would like to refactor. As for now only the requirement is concerning logging so I only touched this part. 

### 1.2. Eslint
Very canonical configuration, I have twisted the indention spaces a little bit, 4 gives the least error, thus I guess the original IDE uses 4 spaces as default, I have no intention to change that. 

### 1.3. NYC and PrePush
Add package and set in package.json


