from formatters.extended_formatter import ExtendedFormatter

def test_extended_formatter_normal_formatting():  
  formatter = ExtendedFormatter()

  assert formatter.format("Price is ${0:.2f} today", 42) == "Price is $42.00 today"
  assert formatter.format("Price: ${price:.2f}", price=42) == "Price: $42.00"
  assert formatter.format("{name} is {age} years old and likes {animal}", 
    name='John',
    age='32',
    animal='birds') == "John is 32 years old and likes birds"
  
  nested = formatter.format('Complex number {0} has real {0.real:.2f} and imaginary {0.imag:.2f} parts.', 3-5j)
  assert nested == 'Complex number (3-5j) has real 3.00 and imaginary -5.00 parts.'
  assert formatter.format('{:*^30}', 'centered') == '***********centered***********'


def test_extended_formatter_join():
  data = {'colors': ['red', 'green', 'blue', 'yellow'], 'name': 'John'}

  formatter = ExtendedFormatter()
  assert formatter.format('{join:data[colors]:, }{item}', data=data) == 'red, green, blue, yellow'
  assert formatter.format('{join:data[colors]}{item}', data=data) == 'redgreenblueyellow'

  result = "John likes red, and John likes green, and John likes blue, and John likes yellow"
  assert formatter.format('{join:data[colors]:, and }{data[name]} likes {item}', data=data) == result


def test_extended_formatter_parse_json():
  data = {'json': '{"a": [42, 36], "name": "John"}'}

  formatter = ExtendedFormatter()
  assert formatter.format('{parse_json:data[json]:person}{person[a][0]}', data=data) == '42'
  assert formatter.format('{parse_json:data[json]:person}{person[a][1]}', data=data) == '36'

  result = "John: 42:36"
  assert formatter.format('{parse_json:data[json]:person}{person[name]}: {person[a][0]}:{person[a][1]}', data=data) == result


def test_extended_formatter_let():
  data = {'name': 'John'}

  formatter = ExtendedFormatter()
  assert formatter.format('{let:data[name]:person}{person}', data=data) == 'John'

def test_extended_formatter_expr():
  data = {'a': 42, 'b': 36, 'c': 2}

  formatter = ExtendedFormatter()
  assert formatter.format('{expr:c*(a + b):result}{result}', **data) == '156'
  assert formatter.format('{let:data[a]:a}{let:data[b]:b}{let:data[c]:c}{expr:c*(a + b):result}{result}', data=data) == '156'


def test_extended_formatter_int():
  data = {'age': '32'}

  formatter = ExtendedFormatter()
  assert formatter.format('{int:data[age]:age}{expr:age+4:x}{x}', data=data) == '36'


def test_extended_formatter_float():
  data = {'weight': '.493'}

  formatter = ExtendedFormatter()
  assert formatter.format('{float:data[weight]:weight}{expr:10*weight:x}{x:.2f}', data=data) == '4.93'


def test_extended_formatter_complex_expr():
  data = {"result": '{"colors": ["red", "green", "blue", "yellow"], "name": "John"}'}

  parse = '{parse_json:data[result]:person}'
  let = '{let:person[name]:name}'
  iterate = '{join:person[colors]:\n}'
  expr = '{expr:index + 1:i}'
  format_str = '{i}. {name} likes {item}'

  formatter = ExtendedFormatter()
  result = "1. John likes red\n2. John likes green\n3. John likes blue\n4. John likes yellow"

  assert formatter.format(f"{parse}{let}{iterate}{expr}{format_str}", data=data) == result
