// Journeys and their locations, in play order. Each location is one pack of levels
// and (in phase 5) one scenery photo.
export const journeys: { name: string; locations: string[] }[] = [
  {
    name: 'Meadow',
    locations: ['Clover Hill', 'Dandelion Field', 'Honeybee Lane', 'Wildflower Rise', 'Buttercup Vale', 'Lark Meadow', 'Poppy Bank', 'Daisy Hollow', 'Hayfield Gate', 'Bluebell Green', 'Willow Brook'],
  },
  {
    name: 'Forest',
    locations: ['Fern Hollow', 'Mossy Path', 'Cedar Grove', 'Birch Glade', 'Owl Wood', 'Pine Ridge', 'Maple Trail', 'Acorn Dell', 'Misty Thicket', 'Old Oak Clearing', 'Elder Creek'],
  },
  {
    name: 'Coast',
    locations: ['Driftwood Bay', 'Seashell Cove', 'Tidepool Point', 'Gull Rock', 'Sandpiper Beach', 'Lighthouse Bluff', 'Kelp Shallows', 'Sea Glass Shore', 'Pebble Strand', 'Harbor Light', 'Dune Grass Way'],
  },
  {
    name: 'Mountain',
    locations: ['Alpine Lake', 'Glacier Pass', 'Eagle Crest', 'Summit Meadow', 'Snowmelt Falls', 'Granite Ridge', 'Edelweiss Slope', 'Cloudline Trail', 'Marmot Basin', 'Larch Valley', 'Echo Peak'],
  },
  {
    name: 'Desert',
    locations: ['Sandstone Arch', 'Mesa Sunset', 'Saguaro Flats', 'Red Canyon', 'Oasis Spring', 'Dune Sea', 'Juniper Wash', 'Painted Hills', 'Cactus Bloom', 'Copper Bluff', 'Mirage Basin'],
  },
  {
    name: 'Night Sky',
    locations: ['Firefly Meadow', 'Moonlit Lake', 'Aurora Field', 'Starfall Ridge', 'Campfire Cove', 'Milky Way Camp', 'Lantern Dock', 'Owl Moon Wood', 'Comet Hill', 'Twilight Pier', 'Quiet Harbor'],
  },
]
