# Brand Kit

Add custom branded headers and footers to your GameCP dashboards. Perfect for white-label hosting providers who want to add their company branding to the interface.

## Features

- **Custom Header**: Add your company name and tagline to the top of dashboards
- **Custom Footer**: Display support information or copyright notices
- **Card Branding**: Optionally add subtle branding badges to individual dashboard cards
- **Page-Level Wrapping**: Demonstrates the AUGMENT method for wrapping entire pages
- **Component-Level Wrapping**: Shows how to wrap individual UI components

## Configuration

After installing, configure the extension with:

- **Header Text**: Your company or network name (e.g., "My Gaming Network")
- **Header Subtext**: Additional text like a tagline or description
- **Footer Text**: Support information, copyright, or links (leave empty to hide footer)

## Example Use Cases

- **White-Label Providers**: Add your company branding to client dashboards
- **Gaming Networks**: Display your network name and support information
- **Multi-Tenant Hosting**: Customize each tenant's dashboard with their branding

## Technical Details

This extension demonstrates the **AUGMENT** injection method:

- Wraps `server.dashboard.page` to add headers/footers to the entire page
- Wraps `server.dashboard.recent_activity` to add branding badges to cards

See `EXTENSION_AUGMENTATION.md` in the root directory for more details on building augmentation extensions.

## License

MIT
