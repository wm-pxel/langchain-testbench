import string
import re
import json
import numexpr

class ExtendedFormatter(string.Formatter):
  def format(self, format_string, *args, **kwargs):
    regex = r"\{(join|parse_json|let|expr|int|float):([^:\}]+)(:([^:\}]+))?\}(.*)"
    join_match = re.fullmatch(regex, format_string, flags=re.DOTALL)

    if not join_match:      
      return super().format(format_string, *args, **kwargs)

    args = join_match.groups()
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
