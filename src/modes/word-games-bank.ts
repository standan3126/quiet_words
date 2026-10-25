// Questions for the grammar games between levels. In tap-a-word sentences the word to tap is
// wrapped in *stars*; punctuation outside the stars stays on the word but isn't part of it.

import type { BreakKind } from '../meta/breaks'
import { GRAMMAR, SPELLING, type Question } from './quiz-bank'

export type WordBreakKind = Exclude<BreakKind, 'wordsearch'>

export interface TapQuestion {
  prompt: string // what to tap
  words: string[] // the sentence, word by word, as shown
  answer: number // index of the word to tap
  fix?: string // spot the mistake: the word that belongs there
  why: string
}

// Splits a sentence with one *starred* word into words and the starred word's index.
function tap(sentence: string): { words: string[]; answer: number } {
  const raw = sentence.split(' ')
  const answer = raw.findIndex((w) => w.includes('*'))
  return { words: raw.map((w) => w.replace(/\*/g, '')), answer }
}

// Spot the mistake: [sentence with the wrong word starred, the right word, why].
const mistakes: [string, string, string][] = [
  ["The dog wagged *it's* tail.", 'its', '"Its" with no apostrophe means belonging to it.'],
  ['We walked *passed* the old mill.', 'past', '"Past" means going by; "passed" is the action of passing.'],
  ['I could *of* stayed all day.', 'have', 'It sounds like "could of", but it\'s "could have".'],
  ['*Their* going to the lake tomorrow.', "They're", '"They\'re" is short for "they are".'],
  ['The ducks swam to *there* nest.', 'their', '"Their" means belonging to them.'],
  ['Is this *you\'re* scarf?', 'your', '"Your" means belonging to you.'],
  ['The soup was *to* hot to eat.', 'too', '"Too" means more than enough.'],
  ['She is taller *then* her brother.', 'than', '"Than" is for comparing.'],
  ['The rain will *effect* our picnic.', 'affect', '"Affect" is the action word here.'],
  ['Try not to *loose* your mittens.', 'lose', '"Lose" means to misplace.'],
  ['There were *less* geese this year.', 'fewer', 'Geese can be counted, so it\'s "fewer".'],
  ['*Me* and Grandma baked a pie.', 'I', 'Try it alone: "I baked", not "me baked".'],
  ['The puppy *laid* down by the fire.', 'lay', 'You lie down yourself; yesterday you "lay" down.'],
  ['He *brung* a basket of apples.', 'brought', 'The past of "bring" is "brought".'],
  ['We *seen* a fox at dawn.', 'saw', '"Saw" stands alone; "seen" needs "have".'],
  ['The bells *rung* at noon.', 'rang', '"Rang" stands alone; "rung" needs "have".'],
  ['She has *wrote* a letter to her aunt.', 'written', 'After "has", use "written".'],
  ['Each of the kittens *have* a bell.', 'has', '"Each" means one at a time, so it takes "has".'],
  ['The herd of deer *are* grazing.', 'is', 'A herd is one group.'],
  ['The garden looks *beautifuly* today.', 'beautiful', 'After "looks", describe the garden itself: "beautiful".'],
  ['He sings *good* in the choir.', 'well', '"Well" describes how something is done.'],
  ['The path was *real* muddy.', 'really', '"Really" is the word that means "very".'],
  ["*Who's* hat is on the bench?", 'Whose', '"Whose" asks who something belongs to.'],
  ['I should *of* brought an umbrella.', 'have', 'It sounds like "should of", but it\'s "should have".'],
  ['The *whether* turned cold overnight.', 'weather', '"Weather" is sun, rain and wind.'],
  ['We had cake for *desert*.', 'dessert', 'The sweet course has two s\'s.'],
  ['Please *except* this little gift.', 'accept', '"Accept" means to receive.'],
  ['The owl *flied* over the barn.', 'flew', 'The past of "fly" is "flew".'],
  ['They *was* singing by the campfire.', 'were', '"They" goes with "were".'],
  ['She *don\'t* like thunderstorms.', "doesn't", '"She" goes with "doesn\'t".'],
  ['The pond has *froze* over.', 'frozen', 'After "has", use "frozen".'],
  ['This is the *bestest* cocoa ever.', 'best', '"Best" is already the most; no "-est" needed.'],
  ['The *mouses* hid in the barn.', 'mice', 'One mouse, two mice.'],
  ['The children *sat* the table for supper.', 'set', 'You "set" a table.'],
  ['Take a deep *breathe* and relax.', 'breath', '"Breath" is the thing; "breathe" is what you do.'],
  ['The library was very *quite*.', 'quiet', '"Quiet" means hushed.'],
  ['Can you *here* the waves?', 'hear', 'You hear with your ear.'],
  ['He gave me a *peace* of bread.', 'piece', 'A "piece" is a part.'],
  ['We *was* late for the train.', 'were', '"We" goes with "were".'],
  ['The cat sat *besides* the window.', 'beside', '"Beside" means next to; "besides" means as well.'],
]

// Parts of speech: [sentence with the one word of that kind starred, part, why].
type Part = 'verb' | 'adjective' | 'adverb'
const speech: [string, Part, string][] = [
  ['The heron waded *slowly* through the reeds.', 'adverb', '"Slowly" tells how the heron waded.'],
  ['Grandpa *whistles* in the garden.', 'verb', '"Whistles" is what Grandpa does.'],
  ['A *tiny* wren sang at dawn.', 'adjective', '"Tiny" describes the wren.'],
  ['The kettle *hummed* on the stove.', 'verb', '"Hummed" is what the kettle did.'],
  ['We walked *quietly* past the sleeping cat.', 'adverb', '"Quietly" tells how we walked.'],
  ['She wore a *woolly* hat to the market.', 'adjective', '"Woolly" describes the hat.'],
  ['The children *giggled* at the puppy.', 'verb', '"Giggled" is what the children did.'],
  ['Snow fell *softly* on the roof.', 'adverb', '"Softly" tells how the snow fell.'],
  ['A *golden* leaf drifted past the window.', 'adjective', '"Golden" describes the leaf.'],
  ['The fox *trotted* across the meadow.', 'verb', '"Trotted" is what the fox did.'],
  ['The baby smiled *happily* at her mother.', 'adverb', '"Happily" tells how the baby smiled.'],
  ['We sat by the *crackling* fire.', 'adjective', '"Crackling" describes the fire.'],
  ['My aunt *bakes* bread on Sundays.', 'verb', '"Bakes" is what my aunt does.'],
  ['The river flowed *gently* to the sea.', 'adverb', '"Gently" tells how the river flowed.'],
  ['A *gentle* breeze moved the curtains.', 'adjective', '"Gentle" describes the breeze.'],
  ['The owl *hooted* from the barn.', 'verb', '"Hooted" is what the owl did.'],
  ['He folded the map *carefully*.', 'adverb', '"Carefully" tells how he folded it.'],
  ['The *sleepy* kitten curled up in a basket.', 'adjective', '"Sleepy" describes the kitten.'],
  ['Bees *buzzed* around the clover.', 'verb', '"Buzzed" is what the bees did.'],
  ['The train arrived *early* this morning.', 'adverb', '"Early" tells when the train arrived.'],
  ['She poured tea into a *chipped* cup.', 'adjective', '"Chipped" describes the cup.'],
  ['The waves *splashed* against the pier.', 'verb', '"Splashed" is what the waves did.'],
  ['The dog barked *loudly* at the mailman.', 'adverb', '"Loudly" tells how the dog barked.'],
  ['We picked *ripe* strawberries in June.', 'adjective', '"Ripe" describes the strawberries.'],
  ['Grandma *knits* by the window.', 'verb', '"Knits" is what Grandma does.'],
  ['The stars shone *brightly* over the hills.', 'adverb', '"Brightly" tells how the stars shone.'],
  ['The *old* lighthouse stood on the cliff.', 'adjective', '"Old" describes the lighthouse.'],
  ['The squirrel *buried* an acorn.', 'verb', '"Buried" is what the squirrel did.'],
  ['She hummed *cheerfully* while she painted.', 'adverb', '"Cheerfully" tells how she hummed.'],
  ['A *muddy* path led to the pond.', 'adjective', '"Muddy" describes the path.'],
  ['The robin *hopped* along the fence.', 'verb', '"Hopped" is what the robin did.'],
  ['The candle flickered *dimly* in the dark.', 'adverb', '"Dimly" tells how the candle flickered.'],
  ['He wrapped the gift in *shiny* paper.', 'adjective', '"Shiny" describes the paper.'],
  ['The clock *chimed* at midnight.', 'verb', '"Chimed" is what the clock did.'],
  ['The turtle crossed the road *safely*.', 'adverb', '"Safely" tells how the turtle crossed.'],
  ['We ate *warm* scones with jam.', 'adjective', '"Warm" describes the scones.'],
]

// Punctuation: which sentence is written correctly. Correct first.
const punctuation: [string, string, string, string][] = [
  ["The cat's bowl is empty.", 'The cats bowl is empty.', "The cats' bowl is empty.", "One cat's bowl takes an apostrophe before the s."],
  ["The birds' nests were in the hedge.", "The bird's nests were in the hedge.", 'The birds nests were in the hedge.', 'Many birds: the apostrophe goes after the s.'],
  ["It's going to rain today.", 'Its going to rain today.', "Its' going to rain today.", '"It\'s" is short for "it is".'],
  ['We need eggs, flour, and butter.', 'We need eggs flour, and butter.', 'We need, eggs, flour and butter.', 'Commas separate the items in a list.'],
  ['Where are you going?', 'Where are you going.', 'Where are you going!', 'A question ends with a question mark.'],
  ['"Come inside," said Mum.', '"Come inside" said Mum.', '"Come inside," said Mum', 'A comma ends the spoken part, inside the quotes.'],
  ["I can't find my keys.", 'I cant find my keys.', "I ca'nt find my keys.", 'The apostrophe stands in for the missing "no".'],
  ['After lunch, we went for a walk.', 'After lunch we, went for a walk.', 'After, lunch we went for a walk.', 'A comma follows an opening phrase.'],
  ['My friend, Sam, loves to sail.', 'My friend Sam, loves to sail.', 'My, friend Sam loves to sail.', 'Commas go on both sides of an added name.'],
  ['What a beautiful sunset!', 'What a beautiful sunset?', 'What, a beautiful sunset.', 'An exclamation shows strong feeling.'],
  ['We visited Paris, France, in May.', 'We visited Paris France in May.', 'We visited Paris, France in, May.', 'A comma separates a city and its country.'],
  ['The children laughed; the puppy barked.', 'The children laughed, the puppy barked', 'The children; laughed the puppy barked.', 'A semicolon can join two complete sentences.'],
  ["Grandma's garden is full of roses.", 'Grandmas garden is full of roses.', "Grandmas' garden is full of roses.", 'The garden belongs to Grandma: "Grandma\'s".'],
  ["They're bringing sandwiches.", 'Theyre bringing sandwiches.', "They'are bringing sandwiches.", '"They\'re" is short for "they are".'],
  ['Yes, I would love some tea.', 'Yes I, would love some tea.', 'Yes I would love, some tea.', 'A comma follows "yes" or "no" at the start.'],
  ['On Monday, March 3, we flew home.', 'On Monday March 3 we flew home.', 'On Monday, March 3 we, flew home.', 'Commas set off the parts of a date.'],
  ['She asked, "Is it snowing?"', 'She asked, "Is it snowing"?', 'She asked "Is it snowing?', 'The question mark belongs to the spoken question.'],
  ['I packed three things: a map, a torch, and a snack.', 'I packed three things, a map: a torch, and a snack.', 'I packed: three things a map, a torch, and a snack.', 'A colon can introduce a list.'],
  ["The children's coats hung by the door.", "The childrens' coats hung by the door.", 'The childrens coats hung by the door.', '"Children" is already plural, so it\'s "children\'s".'],
  ["We'll meet at the bridge.", 'Well meet at the bridge.', "We'l meet at the bridge.", '"We\'ll" is short for "we will".'],
  ['Please close the gate.', 'Please close the gate?', 'Please, close the gate', 'A polite request ends with a full stop.'],
  ['Oh, I forgot my umbrella!', 'Oh I, forgot my umbrella!', 'Oh I forgot, my umbrella!', 'A comma follows a word like "oh".'],
  ['The lake, which was frozen, sparkled.', 'The lake which was frozen, sparkled.', 'The lake, which was frozen sparkled.', 'An extra detail in the middle has a comma on each side.'],
  ["You're welcome to stay.", 'Your welcome to stay.', "Youre' welcome to stay.", '"You\'re" is short for "you are".'],
  ['Dear Aunt Rose,', 'Dear, Aunt Rose', 'Dear Aunt Rose.', 'A friendly letter greeting ends with a comma.'],
  ['The dogs wagged their tails.', "The dog's wagged their tails.", "The dogs' wagged their tails.", 'A plain plural needs no apostrophe.'],
  ['We saw owls, bats, and moths.', "We saw owl's, bat's, and moth's.", 'We saw owls bats, and moths.', 'Plurals take no apostrophe; commas separate the list.'],
  ['"I love autumn," she said, "because of the leaves."', '"I love autumn, she said, because of the leaves."', '"I love autumn," she said "because of the leaves".', 'Each spoken part has its own quotation marks.'],
  ['Wait for me!', 'Wait for me?', 'Wait, for me.', 'A sudden call ends with an exclamation mark.'],
  ['However, the rain stopped by noon.', 'However the rain, stopped by noon.', 'However the rain stopped, by noon.', 'A comma follows "however" at the start.'],
]

// Sentence builder: each is shown jumbled and put back in order.
export const SENTENCES: string[] = [
  'The kettle sang on the stove.',
  'A robin built a nest in spring.',
  'We watched the sunset from the hill.',
  'The cat napped in a patch of sun.',
  'Grandma knitted a scarf for winter.',
  'The ducks paddled across the pond.',
  'Fresh bread cooled on the windowsill.',
  'Snow covered the quiet village.',
  'The owl hooted from the old barn.',
  'We picked apples in the orchard.',
  'The lighthouse glowed through the fog.',
  'A gentle breeze rustled the leaves.',
  'The children built a sandcastle by the sea.',
  'My dog loves long walks in the park.',
  'The bees hummed among the flowers.',
  'We drank cocoa by the warm fire.',
  'The stars twinkled above the lake.',
  'A fox crept through the tall grass.',
  'She read a book under the willow.',
  'The train rolled slowly into the station.',
  'Rain tapped softly on the window.',
  'The farmer stacked hay in the barn.',
  'We planted tulips along the fence.',
  'The moon rose over the mountains.',
  'A little boat drifted down the river.',
  'The puppy chased a butterfly.',
  'Grandpa told stories by the campfire.',
  'The garden smelled of fresh mint.',
  'We heard waves crash on the shore.',
  'The squirrel hid acorns for winter.',
  'Frost sparkled on the morning grass.',
  'The baker sold warm muffins at dawn.',
  'A deer drank from the cool stream.',
  'The children sang songs on the bus.',
  'Leaves turned red and gold in autumn.',
  'The violin played a sweet tune.',
  'We hiked to a waterfall in the forest.',
  'The kitten tangled the ball of yarn.',
  'A rainbow appeared after the storm.',
  'The cabin was cozy and warm.',
]

const PROMPTS: Record<Part, string> = { verb: 'Tap the verb', adjective: 'Tap the adjective', adverb: 'Tap the adverb' }

export const MISTAKES: TapQuestion[] = mistakes.map(([s, fix, why]) => ({ prompt: 'Tap the word that’s wrong', ...tap(s), fix, why }))
export const SPEECH: TapQuestion[] = speech.map(([s, part, why]) => ({ prompt: PROMPTS[part], ...tap(s), why }))
export const PUNCTUATION: Question[] = punctuation.map(([a, b, c, why]) => ({ prompt: 'Which is written correctly?', choices: [a, b, c], why }))

// A fixed shuffle of a bank, walked through in order, so nothing repeats until all are seen.
export function orderOf(length: number, seed: number): number[] {
  const order = Array.from({ length }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const j = seed % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

const SIZES: Record<WordBreakKind, number> = {
  grammar: GRAMMAR.length,
  spelling: SPELLING.length,
  punctuation: PUNCTUATION.length,
  mistake: MISTAKES.length,
  speech: SPEECH.length,
  unscramble: SENTENCES.length,
}

const ORDERS = Object.fromEntries(Object.entries(SIZES).map(([kind, size], k) => [kind, orderOf(size, 7 + k * 31)])) as Record<WordBreakKind, number[]>

// Which question of a game's bank is the `n`th one asked.
export function bankIndex(kind: WordBreakKind, n: number): number {
  const order = ORDERS[kind]
  return order[n % order.length]
}
