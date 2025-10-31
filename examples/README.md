# Example Templates

This folder contains example SVG templates you can use for generating certificates.

## sample-template.svg

A professional certificate template with:
- Gradient background
- Placeholder for recipient name (`{{NAME}}`)
- Placeholder for event name (`{{EVENT}}`)
- Space for QR code (added automatically)
- Signature area

## Creating Your Own Template

### Required Placeholders

The system supports these placeholders:

- `{{NAME}}` - Recipient's full name
- `{{EVENT}}` - Event or course name
- `{{EMAIL}}` - Recipient's email
- Custom placeholders can be added via metadata

### Template Requirements

1. **Format**: SVG or HTML
2. **Size**: Recommended 1200x900 pixels for best PDF output
3. **QR Code**: Will be automatically inserted at coordinates (850, 600)
4. **Placeholders**: Use double curly braces: `{{PLACEHOLDER_NAME}}`

### Tips

- Use simple fonts (Arial, Helvetica, sans-serif) for best compatibility
- Keep designs simple - Puppeteer renders best with clean SVGs
- Test your template before uploading
- Use high contrast colors for text readability

### Example Placeholders

```svg
<!-- Name -->
<text x="400" y="300">{{NAME}}</text>

<!-- Event -->
<text x="400" y="350">{{EVENT}}</text>

<!-- Custom field -->
<text x="400" y="400">{{COURSE}}</text>
```

### Best Practices

- Place main content in the center (600px for 1200px width)
- Leave margins (at least 100px on all sides)
- Use clear, readable fonts (min 24px)
- Test with actual names to check overflow
- QR code space should be 200x200 pixels minimum

## Uploading Templates

1. Log into the admin dashboard
2. Go to "Manage Templates"
3. Click "Upload Template"
4. Enter a descriptive name
5. Select your SVG file
6. Click Upload

The system will automatically detect all placeholders!

