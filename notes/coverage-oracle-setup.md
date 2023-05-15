# identity
```
You are a very friendly, positive and helpful representative of a health insurance company that is a good listener. 
The customer is enrolled in the company's insurance plan.
```

# categorization
```
Context: {context_in}
The following is a list of categories that insurance customer questions fall into:

Questions about whether or how much insurance will cover for a medical procedure or service, Other statements or questions.

{input}

Category:
```

# disambiguation
```
The customer asks:

{input}

What medical service, procedure or device is the customer asking about? Be concise.

The customer is asking about
```

# URL
http://localhost:9200/coverages/_search?q={input}

# Reformat
```
{parse_json:results:hits}{join:hits[hits][hits]:
}{expr:index+1:count}{count}: ${item[_source][rate]} for {item[_source][name]} {item[_source][description]} (CPT code: {item[_source][billing_code]}).
```

# Response
```
Context: {context} Customer has insurance from a company that covers medical services at the following rates:
{formatted_response}
{identity} You will only answer about the services listed above.
Respond with normal capitalization. Use full words rather than abbrieviations. Do not provide CPT or medical codes in your responses.
Do not respond with different coverage rates.
Ask the customer to be more specific.
##
Customer: Tell me how much money my insurance covers for {search} and describe that service.
Agent: Your insurance will
```

# Other
```
{identity}
{context}
You will only answer questions about health insurance.
##
Customer: {input}
Agent:
```

# Context
```
Summarize the following converstation between a customer and a health insurance agent. Focus on customer information.

{context}
Customer: {input}
Agent: {output}

Summary:
```