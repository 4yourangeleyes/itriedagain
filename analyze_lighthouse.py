import json

try:
    with open('lighthouse-report.json', 'r') as f:
        data = json.load(f)

    print("Lighthouse Scores:")
    categories = data.get('categories', {})
    for category_id, category in categories.items():
        score = category.get('score')
        if score is not None:
            print(f"- {category.get('title')}: {int(score * 100)}")
        else:
            print(f"- {category.get('title')}: N/A")

    print("\nKey Metrics:")
    audits = data.get('audits', {})
    metrics = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift',
        'speed-index',
    ]
    for metric in metrics:
        audit = audits.get(metric, {})
        display_value = audit.get('displayValue')
        print(f"- {audit.get('title')}: {display_value}")

except Exception as e:
    print(f"Error analyzing report: {e}")
