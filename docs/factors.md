# The factors file should be structured as follows
The factors file should be a JSON file containing an array of objects. Each object describes a single factor.
For each factor a the following parameters can or must be set.
```json
[
  {
    "name": "string",
    "value": "number | Formula",
    "start_value": "number",
    "type": "'static' | 'modeled'",
    "set_manually": "true | false",
    "dependence": "'exogenous' | 'endogenous'",
    "error_low": "Formula",
    "error_high": "Formula",
    "helper": "true | false"
  }
]
```
# Required factors
Factors with the name `D_LOA*` and `A_LOA*` for every automation state.
These values define level of confidence of either the drive `D_LOA` or automation `A_LOA` at a moment in time, within the domain `[0, 1]`.
Otherwise the value will be capped to this domain.

# Detailed description of variables
Here we describe per variable how they should be used, and are processed.

name
----
The `name` variable is used to define the name of the factor. It can also by used in Formulas to define
endogenous variables.

value
-----
The `value` parameter can be a *number* if and only if `type` equals *'static'*. Otherwise it is should be become a Formula.

Formulas are defined are strings using *python* notation of mathematical equations. All function defined in the `math` 
package are allowed.

In order to define a recursive function
we can use `${-1}` to reference 1 step back in the past and `${-2}` for 2 steps back etc.
If the past value is not defined the `start_value` will be used. 

In order to model a variable based on the current time step of the simulation the variable `${_t}` can be used.

In order to define an endogenous variables Formula we can also reference other variables by `${var_name}`. In case we reference
other variables the read values are used not the real values.

start_value
-----------
The `start_value` will be used if value can not be calculated as it is formulated as a function of past values not yet defined.

type
----
If the factor is *'static'* a *number* is expected as `value`. If it is `'modeled'` a Formula is expected.

set_manually
------------
If set to `true` we are able to manually change it as the simulation is running. Default is `false`.

dependence
----------
The `dependence` variable defined if the value should be computed as a Formula
of other factors, this also makes a difference in how error is handles.
As for endogenous variables error is calculated as a an error of its components,
while for exogenous it must be defined, or it is considered to equal 0.

error_low, error_high
-----
First of all, error is only relevant for exogenous variables as for endogenous variables it is computed via their components.

At this point the measurement error is normally distributed with mean of the real value
and as standard deviation the `error` value value. For endogenous variables we do not define an error as the value is
computed from the input values of the exogenous variables.

helper
------------
Default `false`, can be set to true in order to define helper functions for other variables, this way we can define more
complex simulations. Helper variables will not be outputted by the output module.
