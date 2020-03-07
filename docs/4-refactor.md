# 4.Refactor
The refactor is to retract the parts of validation and db operation to be separated files and change callbacks to await/async 
The committed one is the version with least change, actually the validation part should be extract to be two parts, sanitation which checks and converts the parameters into legal type and validation which checks all the fields types against constraints
These parts can be done by a middleware if the validation is uniform across all calls or it can be done in the pipeline in the express framework, I especially recommand using `yup` package to do it instead of the validation in the sample code
DB operation can also be changed to `sequelize` package with standard operations defined.


