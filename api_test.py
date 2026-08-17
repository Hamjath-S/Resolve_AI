import requests

response = requests.get("https://jsonplaceholder.typicode.com/todos/1")

data = response.json()

print("================================")
print("        API TEST RESULT")
print("================================")

print("Status:", response.status_code)
print("ID:", data["id"])
print("Title:", data["title"])
print("Completed:", data["completed"])

print("================================")