# 5.Refactor
For the main code part, it is done in section 4 accidentally, the method is simple, just extract the sql parameters part out, and don't use string concatenation as sql statement , as the user can play around the actual query which should be forbidden. To input as parameters in the sql statement, special chars are escaped.



