import string
import re
import json
import numexpr

class ExtendedFormatter(string.Formatter):
  """
  This class extends the standard Python string formatter to add some extra
  features that are useful for formatting data for the LangChain.

  The following expressions are added:

  - `{join:[varexpr]:[separator]}`: Join an array found at varexpr with the separator. For each
    item in the array, the rest of the format string is formatted with the item as the `item` variable
    and the index of the item as the `index` variable. If no separator is provided, the items are
    joined without a separator. Example:
    format('{join:data[colors]:, }{index}:{item}', data={'colors': ['r','g','b']})) -> '0:r, 1:g, 2:b'
  - `{parse_json:[varexpr]:[varname]}`: Parse a JSON string found at varexpr and store the result
    in a variable with the name varname which will be available in the rest of the expression.
    If no varname is provided, the variable is named `data`.
    Example: format('{parse_json:data[json]:person}{person[name]}', data={'json': '{"name": "John"}'}) -> 'John'
  - `{let:[varexpr]:[varname]}`: Store the value found at varexpr in a variable with the name varname
    which will be available in the rest of the expression. If no varname is provided, the variable
    is named `data`.
    Example: format('{let:data[name]:person}{person}', data={'name': 'John'}) -> 'John'
  - `{expr:[expr]:[varname]}`: Evaluate the math expression expr using numexpr and store the result
    in a variable with the name varname which will be available in the rest of the expression.
    Note that variables used in [expr] must be ints or floats and cannot be nested format expressions
    (eg. a[b] or a.b will not work). Use the int or float expressions to prepare data to use in expressions.
    If no varname is provided, the variable is named `data`.
    Example: format('{expr:a*b:result}{result}', a=2, b=3) -> '6'
  - `{int:[varexpr]:[varname]}`: Parse varexpr as an integer in a variable with the name varname which
    will be available in the rest of the expression. If no varname is provided, the variable is named `data`.
    Example: format('{int:result[age]:age}{expr:age+4:result}{result}', result={'age': '2.0001'}) -> '6'
  - `{float:[varexpr]:[varname]}`: Parse varexpr as a float in a variable with the name varname which
    will be available in the rest of the expression. If no varname is provided, the variable is named `data`.
    Example: format('{float:result[age]:age}{expr:age+4:result}{result}', result={'age': '2.5'}) -> '6.5'
  """
  def format(self, format_string, *args, **kwargs):
    regex = r"\{(join|parse_json|let|expr|int|float):([^:\}]+)(:([^:\}]+))?\}(.*)"
    match = re.fullmatch(regex, format_string, flags=re.DOTALL)

    if not match:      
      return super().format(format_string, *args, **kwargs)

    args = match.groups()
    value = args[1]
    arg = args[3]
    rest = args[4]

    if args[0] == "join":
      return self.join(value, arg, rest, args, kwargs)
    elif args[0] == "parse_json":
      return self.parse_json(value, arg, rest, args, kwargs)
    elif args[0] == "let":
      return self.let(value, arg, rest, args, kwargs)
    elif args[0] == "expr":
      return self.expr(value, arg, rest, args, kwargs)
    elif args[0] == "int":
      return self.int(value, arg, rest, args, kwargs)
    elif args[0] == "float":     
      return self.float(value, arg, rest, args, kwargs)

    return super().format(format_string, *args, **kwargs)


  def join(self, iterator_exp, separator, inner_format, args, kwargs):
    separator = '' if separator is None else separator
    iterator = self.get_field(iterator_exp, args, kwargs)[0]

    return separator.join(self.format(inner_format, *args, **{**kwargs, "item": item, "index": index})
      for index, item in enumerate(iterator))
  

  def parse_json(self, json_string_exp, variable_name, rest, args, kwargs):
    variable_name = 'data' if variable_name is None else variable_name
    json_string = self.get_field(json_string_exp, args, kwargs)[0]
    
    parsed = json.loads(json_string)
    return self.format(rest, *args, **{**kwargs, variable_name: parsed})


  def let(self, value_exp, variable_name, rest, args, kwargs):
    variable_name = 'data' if variable_name is None else variable_name    
    value = self.get_field(value_exp, args, kwargs)[0]

    return self.format(rest, *args, **{**kwargs, variable_name: value})
  

  def int(self, value_exp, variable_name, rest, args, kwargs):
    variable_name = 'data' if variable_name is None else variable_name    
    value = self.get_field(value_exp, args, kwargs)[0]

    return self.format(rest, *args, **{**kwargs, variable_name: int(value)})
  

  def float(self, value_exp, variable_name, rest, args, kwargs):
    variable_name = 'data' if variable_name is None else variable_name    
    value = self.get_field(value_exp, args, kwargs)[0]

    return self.format(rest, *args, **{**kwargs, variable_name: float(value)})

  def expr(self, expression, variable_name, rest, args, kwargs):
    variable_name = 'data' if variable_name is None else variable_name
    result = numexpr.evaluate(expression, global_dict={}, local_dict=kwargs)
    return self.format(rest, *args, **{**kwargs, variable_name: result})
