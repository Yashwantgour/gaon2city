# UI / UX Guidelines

## Design Goal

Professional marketplace UI without copying Amazon or Flipkart.

## Visual Language

Use:
- white/neutral backgrounds
- dark readable text
- one primary brand color
- restrained accent usage
- subtle borders/shadows
- clear spacing
- rounded corners used consistently

Avoid:
- rainbow UI
- excessive gradients
- excessive shadows
- too many badges
- visual clutter
- animation everywhere

## Responsive Requirements

Must work well on:
- mobile
- tablet
- laptop
- desktop

Design mobile-first.

## Homepage

Suggested structure:

```text
Header
Search
Location
Categories
Nearby Products
Recently Added
Popular Categories
Seller CTA
Footer
```

The most important area is:

```text
Nearby Products
Within 10 km
```

## Product Card

Show:
- image
- title
- price
- condition
- distance
- seller name
- seller type where useful
- availability

Example:

```text
[ IMAGE ]

Wheat
₹2,500 / quintal

📍 3.2 km away
Farmer

[View Product]
```

## Product Details

Show:
- image gallery
- title
- price
- description
- seller
- location distance
- condition
- availability
- pickup/delivery
- actions

Actions:
- Buy
- Chat Seller
- Favorite
- Go to Seller

## Location UX

On first marketplace use:

```text
Find products near you

Allow location
or
Select village/city
```

Do not repeatedly ask for permission.

## Empty States

Examples:

```text
No products within 10 km.
Try increasing the search radius.
```

```text
No products found.
Try another category or search term.
```

## Error States

Errors must be understandable to normal users.

Do not expose:
- stack traces
- SQL errors
- internal service details
- secret/config information

## Accessibility

Support:
- keyboard navigation
- semantic HTML
- visible focus
- sufficient contrast
- labels for forms
- alt text
- accessible dialogs
- readable touch targets

## Motion

Use Framer Motion subtly.

Prefer:
- fade
- slide
- scale
- layout transitions

Keep important interactions fast and predictable.
