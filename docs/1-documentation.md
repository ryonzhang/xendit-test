# 1.Documentation
This short readme will communicate my philosophy of a good documentation strategy

### 1.1 Different Options
There are many documentation tools currently in the market, such as stoplight,redoc,etc. Basically they all serve one purpose, generating the online readable endpoint description panel for users to understand the usage of the APIs. However they differ in certain ways based on the requirement of the client. Some tools will generate based on the existing yaml,xml,json configuration files into a webpage such as redoc, others could provide a cloud solution for requirement exchange like stoplight. Here I tried something new for a reason.

### 1.2. My Option
For this task I decided to try something noval, `express-swagger-generator`. I still utilize all the convenience that swagger-like portal provides like displaying and testing APIs. Nevertheless, I am also a fan of the idea `simple is beautiful` which in tooling, it becomes `no tooling is the best tooling`. `express-swagger-generator` provides a way without the bustle and hustle of redoc bundle every time we need to commit something, and also keeps developer with good habit of commenting in a uniform and predefined way (a big bonus, if comments are not regulated, you can see people with a lot of characters present in the same codebase very likely happening after a short while), and now comments make sense, because if comments delink with the code substance, the swagger will display wrongly which the frontend team will complain (complaint make world a far better place because it prevents people from making stupid mistakes). Thus I select this package, which simply enables developers to write code with meaningful comments and voila, nothing else, single source of truth, very easy to maintain.

### 1.3. Short Demo
I have provided a little demo about how the swagger page looks for the project, don't hesitate to press [here](https://github.com/ryonzhang/backend-coding-test/blob/1.documentation/assets/1-documentation.webm "here")

### 1.4. How to run
With Correctly commented code, you can see the docs under endpoint /api-docs,please refer to https://www.npmjs.com/package/express-swagger-generator for more syntax guide
