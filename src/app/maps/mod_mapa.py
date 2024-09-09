import json

# Leer el archivo JSON
with open("mapa_raro.json", "r") as file:
    data = json.load(file)

# Modificar las propiedades de los objetos
for layer in data.get("layers", []):
    if layer.get("type") == "objectgroup":
        for obj in layer.get("objects", []):
            
            if "properties" in obj:
                new_properties = {}
                for prop in obj["properties"]:
                    new_properties[prop["name"]] = prop["value"]
                obj["properties"] = new_properties


with open("lvl_0.js", "w") as file:
    file.write("let lvl_0 = ")
    file.write(json.dumps(data, indent=4))
    file.write(";\n\nexport { lvl_0 };")
