# Welcome Card

Simple, animation-free welcome header for a Home Assistant dashboard: clock,
time-of-day greeting, today's weather, and an optional row of entity chips.

## Installation

Add this repository to HACS as a custom **Dashboard** repository and install it.

```yaml
type: custom:welcome-card
weather: weather.forecast_home
entities:
  - sensor.iphone_alex_mihalascu_battery_level
  - entity: person.alex
    name: Alex
    icon: mdi:account
```

No canvas, no particle animation, no rotating sun arc — just a static
time-of-day gradient background, a large digital clock, and the weather.
`name` is optional; without it the greeting uses `hass.user.name`, so each
logged-in person sees their own name. `entities` renders as tappable chips
below the weather row (opens the entity's more-info dialog).

## License

MIT
