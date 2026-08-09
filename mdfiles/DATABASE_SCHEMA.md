# Database Design

Database: Supabase PostgreSQL.

Geospatial functionality: PostGIS.

## Core Tables

### profiles

```text
id
name
phone
email
avatar_url
village
city
district
state
postal_code
seller_type
verification_status
created_at
updated_at
```

### categories

```text
id
name
slug
parent_id
created_at
```

### products

```text
id
seller_id
category_id
title
slug
description
price
quantity
condition
status
latitude
longitude
location
pickup_available
delivery_available
created_at
updated_at
```

`location` should be a PostGIS geographic point where practical.

### product_images

```text
id
product_id
storage_path
display_order
created_at
```

### orders

```text
id
buyer_id
seller_id
total_amount
status
payment_status
fulfillment_type
pickup_location
delivery_location
created_at
updated_at
```

### order_items

```text
id
order_id
product_id
quantity
unit_price
subtotal
created_at
```

### payments

```text
id
order_id
provider
provider_order_id
provider_payment_id
amount
currency
status
created_at
updated_at
```

### conversations

```text
id
buyer_id
seller_id
product_id
order_id
created_at
updated_at
```

### messages

```text
id
conversation_id
sender_id
message
image_path
read_at
created_at
```

### reviews

```text
id
order_id
reviewer_id
seller_id
rating
review
created_at
```

### favorites

```text
user_id
product_id
created_at
```

### reports

```text
id
reporter_id
reported_user_id
product_id
reason
description
status
created_at
resolved_at
```

## Important Relationships

```text
profiles 1 ─── N products
categories 1 ─── N products
products 1 ─── N product_images

profiles 1 ─── N orders as buyer
profiles 1 ─── N orders as seller

orders 1 ─── N order_items
orders 1 ─── N payments

conversations 1 ─── N messages

orders 1 ─── N reviews
profiles 1 ─── N reviews
```

## Geospatial Rule

Nearby query should be performed in PostgreSQL/PostGIS.

Conceptual:

```sql
ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
  :radius_meters
)
```

Distance can be calculated using:

```sql
ST_Distance(...)
```

Create appropriate geospatial indexes.

## Security

Enable RLS.

Examples:
- seller can modify only their own products
- user can see their own private profile fields
- buyer can see their own orders
- seller can see orders involving their products
- conversation participants can access conversation messages
- users can create reviews only for eligible completed orders

Never rely on frontend checks alone.
