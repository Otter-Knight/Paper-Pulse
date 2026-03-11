import json
from jinja2 import Template
import os

def generate_site():
    # Load data
    with open('data/papers.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Load template
    with open('templates/index.html', 'r', encoding='utf-8') as f:
        template = Template(f.read())
    
    # Render
    html = template.render(
        generated_at=data['generated_at'],
        total_papers=data['total_papers'],
        filtered_papers=data['filtered_papers'],
        papers=data['papers']
    )
    
    # Save
    os.makedirs('docs', exist_ok=True)
    with open('docs/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("✅ Site generated at docs/index.html")

if __name__ == "__main__":
    generate_site()
