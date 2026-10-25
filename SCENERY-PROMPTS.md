# Scenery prompts

Twelve **daytime** pictures to start with: two for each of the six journeys, a soft daytime
scene and a warm golden-hour scene. The daytime picture (`-1`) shows until 5pm and the
golden-hour picture (`-2`) from 5pm until night mode, changing only between levels, never in
the middle of a puzzle. More pictures can follow the same rule: odd numbers are daytime, even
numbers golden hour, and the locations in a journey take turns using them. Journeys without
pictures keep using the painted scenes.

At night the game always shows its painted night scene with fireflies, so no night pictures
are needed.

## Image settings

- **Shape:** portrait, 9:16 (for example 1080 × 1920). Use your generator's tall/phone ratio.
- **File:** JPEG, around 80% quality, under 1.5 MB each.
- **Where:** save into `public/scenery/` using the file name shown for each prompt,
  then run `npm run scenery` so the game picks them up.

## Why the prompts are written this way

- The crossword sits over the **top half** of the picture and the letter wheel over the
  **bottom third**, so the prompts ask for an open, simple sky and a horizon near the middle.
  A busy picture makes the letters harder to read.
- The same style line goes at the end of every prompt so all twelve feel like one set.

**Style line, added to the end of every prompt:**

> soft natural landscape photograph, gentle diffused light, muted natural colours, calm and
> quiet mood, low contrast, slight haze, simple open sky in the upper half, horizon near the
> middle, no people, no text, no watermark, vertical 9:16

---

## Meadow

**`meadow-1.jpg`**
> Rolling green meadow in early morning, scattered white clover and small daisies in the
> foreground grass, gentle low hills fading into soft mist, a single willow far away, pale
> cream and blue sky with thin clouds, [style line]

**`meadow-2.jpg`** (golden hour)
> Wildflower meadow just after sunset, warm golden-orange afterglow along a low horizon,
> tall grasses and seed heads silhouetted, a few fireflies as tiny warm points of light,
> a lone willow tree in silhouette, sky fading from amber to deep brown, [style line]

## Forest

**`forest-1.jpg`**
> Quiet forest path winding between tall birch and pine trees, soft green ferns and moss on
> the ground, light morning mist between the trunks, gentle sunbeams from above, a bright
> open gap in the canopy at the top, [style line]

**`forest-2.jpg`** (golden hour)
> An old oak clearing at golden dusk, last warm amber light glowing low between the trunks,
> soft orange haze, dark silhouetted branches framing an open warm sky, ferns in the
> foreground, [style line]

## Coast

**`coast-1.jpg`**
> Calm sheltered cove with pale sand and smooth driftwood in the foreground, gentle small
> waves, soft grey-green sea meeting a hazy horizon, low grassy headland on one side,
> overcast pearl-white sky, [style line]

**`coast-2.jpg`** (golden hour)
> A quiet harbour at sunset, calm water reflecting a deep orange and gold sky, a small
> distant lighthouse with a warm light on the headland, wooden posts of an old pier in
> silhouette, [style line]

## Mountain

**`mountain-1.jpg`**
> Still alpine lake reflecting soft grey-green mountains, larch trees along the shore,
> wildflowers at the water's edge, a little cloud resting on the far peaks, pale morning
> sky, [style line]

**`mountain-2.jpg`** (golden hour)
> Mountain valley at alpenglow, distant peaks lit warm pink and orange by the setting sun,
> the valley below in soft shadow, a small campfire glowing near a lake in the foreground,
> sky warm amber fading to brown, [style line]

## Desert

**`desert-1.jpg`**
> Soft red sandstone mesas under a pale warm morning sky, smooth wind-rippled sand in the
> foreground, a few sage bushes and a small juniper, gentle haze over the distant cliffs,
> [style line]

**`desert-2.jpg`** (golden hour)
> Desert at sunset, tall saguaro cacti silhouetted against a glowing deep orange and gold
> sky, distant mesas as dark layered shapes, warm light on the sand, [style line]

## Night Sky

**`night-sky-1.jpg`**
> Open grassy hilltop at twilight just after sunset, soft peach and lavender sky with the
> first few stars, gentle rolling hills in silhouette, a calm lake far below catching the
> last light, [style line]

**`night-sky-2.jpg`** (campfire evening)
> A small campfire beside a calm lake under a warm starry sky, firelight glowing on nearby
> stones and grass, faint warm-tinted stars, dark silhouetted pine trees around the shore,
> a deep brown and amber night, [style line]

---

## Adding more later

- Keep numbering: `coast-3.jpg`, `coast-4.jpg`, and so on. The locations in a journey
  take turns using them.
- The location names make good prompt ideas. For example, Coast has *Driftwood Bay*,
  *Seashell Cove*, *Tidepool Point*, *Gull Rock* and *Lighthouse Bluff*. All the names are in
  `tools/journeys.ts`.
- Journey names for files: `meadow`, `forest`, `coast`, `mountain`, `desert`, `night-sky`.
- After adding or removing images, run `npm run scenery` again.
