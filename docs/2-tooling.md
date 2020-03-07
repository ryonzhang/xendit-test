# 2..Tooling
This short readme will brief the opinionated tooling config

### 2.1 Winston
Info and error will be logged to Console during dev and logged to combined file while only error will be logged to error file. I have restructure the error logging part using middleware to handle the error catching and parsing as a more neat way. Although for the core structure, there are so many things I would like to refactor. As for now only the requirement is concerning logging so I only touched this part. 

### 2.2. Eslint
Very canonical configuration, I have twisted the indention spaces a little bit, 4 gives the least error, thus I guess the original IDE uses 4 spaces as default, I have no intention to change that. 

### 2.3. NYC and PrePush
Add package and set in package.json

### 2.4 Notice
The change for the error-throwing mechanism is changed by using `throw` directly to using `next` function because the error thrown inside db operation callback will be considered as an uncached exception handled by the process not the express.


