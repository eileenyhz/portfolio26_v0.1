import type { CaseStudy } from "./types";

// Case studies, keyed by project id, following the mentor's frame: what it is and for whom, the outcome, one big pain point,
// then the user flow (before, while, after) with one sub-pain, solution and screen for each step. The pop-up shows one step
// at a time. Fact values may hold inline HTML (bold outcomes, links).
export const CASE_STUDIES: Record<string, CaseStudy> = {
  p1: {
    lede: "An agentic system that styles what you own and shops what you’re missing.",
    facts: [["What", "Agentic fashion web app"], ["For", "Fashion-aware Gen Z and millennials"], ["Role", "Co-founder · Design"], ["Team", "Lexi L. (co-founder)"],
      ["Outcome", "<b>5,000+ users · 30,000+ uploads · 50–70% weekly retention</b> in a 2-week beta (late 2024). Seed funded; top 5% at YC."]],
    cover: { cls: "bleed", shots: [["Mōtif screens", "/img/motif-cover.webp"]] },
    pain: "Getting dressed takes too much effort, even with a full closet.",
    painNote: "90% spend 10+ minutes a day choosing; 80% rarely wear what they own.",
    sol: [
      { when: "Before", step: "Capture what I wear", pain: "I don’t know what I own.", k: "Wardrobe Keeper:", fix: "one outfit photo, every piece tagged and filed.", why: "Beta: few opened the closet itself, so capture lives in the daily log.", fit: "phone", shots: [["Outfit log", "/img/motif-log.webp"], ["My closet", "/img/motif-closet.webp"]] },
      { when: "During", step: "Get outfit ideas", pain: "Nothing I see works with my clothes.", k: "Personal Stylist:", fix: "styles what you own. Lock a piece, regenerate the rest, or shop the gap on budget.", why: "Beta: most locked one item; ~95% wanted matching buys.", fit: "phone", shots: [["Style what I own", "/img/motif-stylist.webp"], ["Find an addition", "/img/motif-shop.webp"]] },
      { when: "After", step: "See my style grow", pain: "I can’t put my style into words.", k: "Style Analyst:", fix: "turns your outfit history into style cards that level up.", why: "Beta: ~80% retook the style test.", fit: "phone", shots: [["Style profile", "/img/motif-profile.webp"], ["Designer DNA", "/img/motif-dna.webp"]] }
    ],
    extras: [{ step: "Style cards", note: "Each style you wear unlocks a polaroid that levels up.", view: { kind: "polaroid",
      items: ([["casual", "Casual", 2, 55], ["minimalist", "Minimalist", 1, 30], ["edgy", "Edgy", 1, 80], ["bohemian", "Bohemian", 1, 15], ["athleisure", "Athleisure", 1, 40], ["romantic", "Romantic", 1, 10], ["glam", "Glam", 1, 20], ["streeturban", "Street", 1, 35], ["sophisticated", "Sophisticated", 1, 5]] as const).map(([f, l, lv, pc]): [string, string, number, number] => [`/img/motif-style-${f}.webp`, l, lv, pc]) } }]
  },
  p2: {
    lede: "Redesigns that help AI-art creators finish uploads, and come back.",
    facts: [["What", "AI art generator: image generation and shared models"], ["For", "Anime fans who generate art and share AI models"], ["Role", "PM · UI/UX intern"],
      ["Team", "Raven G. (CEO) · Anonymous (product lead)"],
      ["Outcome", "<b>Notification CTR 3% → 12% · +18% daily engagement · +7% feature adoption</b> (A/B tests on core flows)."],
      ["Visit", `<a href="https://pixai.art/en" target="_blank" rel="noopener">pixai.art ↗</a>`]],
    cover: { cls: "collage", shots: [["Daily tasks and challenges", "/img/pixai-tasks.webp", "left:5%;top:7%;width:68%"], ["Claim your credits", "/img/pixai-credits.webp", "left:59%;top:10%;width:36%"], ["The guided model upload", "/img/pixai-upload.webp", "left:25%;top:36%;width:70%"], ["Notifications", "/img/pixai-notifs.webp", "left:5%;top:50%;width:33%"], ["Likes", "/img/pixai-likes.webp", "left:60%;top:61%;width:29%"]] },
    pain: "Creators gave up before finishing, and had little reason to come back.",
    painNote: "A dense upload form, a weak daily loop, one button for every update.",
    sol: [
      { when: "Before", step: "Upload a model", pain: "This form is too long; I’ll finish later.", k: "Guided upload:", fix: "four stages with progress, confirmed uploads, and Back/Next, one step at a time.", why: "The old flow was one chunky page; many creators closed it before finishing. Form completion rose about 20%.", fit: "wide", shots: [["Before: one long form", "/img/pixai-onepage.webp"], ["After: a guided upload", "/img/pixai-upload.webp"]] },
      { when: "During", step: "Come back daily", pain: "Why open the app today?", k: "Daily rewards:", fix: "check-ins, tasks and art challenges that pay out credits, with the claim button right beside them.", why: "Daily engagement rose 18%.", fit: "wide", shots: [["Daily tasks and challenges", "/img/pixai-tasks.webp"], ["Claim your credits", "/img/pixai-credits.webp"]] },
      { when: "After", step: "See what happened", pain: "Every update is buried in one pile.", k: "Sorted notifications:", fix: "likes, comments and followers get their own tabs; announcements stay apart, with previews to scan.", why: "Notification click-through rose from 3% to 12%.", fit: "phone", shots: [["All updates", "/img/pixai-notifs.webp"], ["Likes", "/img/pixai-likes.webp"]] }
    ],
    extras: []
  },
  p3: {
    lede: "Describe a world in a few sentences, then play it as a game.",
    facts: [["What", "Gen-AI game engine"], ["For", "Gamers who want to make their own games"], ["Role", "Design lead"], ["Team", "Felix W. · Allen Z. (co-founders)"],
      ["Outcome", "<b>50k monthly active users</b> after the first month · <b>3 games</b> per user a week. Backed by MiraclePlus."],
      ["Watch", `<a href="https://www.youtube.com/watch?v=b8Zba4JSr6g" target="_blank" rel="noopener">An influencer plays an early version ↗</a>`]],
    cover: { cls: "collage", shots: [["Describe a world", "/img/dreamin-world.webp", "left:5%;top:6%;width:72%"], ["Who lives here?", "/img/dreamin-characters.webp", "left:23%;top:35%;width:72%"], ["Play and talk to characters", "/img/dreamin-play.webp", "left:8%;top:64%;width:72%"]] },
    pain: "Billions play games, but making one takes a team’s worth of skills.",
    painNote: "Art, music, game design and code: few creators have them all.",
    sol: [
      { when: "Before", step: "Describe a world", pain: "I can’t draw a map.", k: "One prompt:", fix: "describe your world; Randomize and Finish writing help when you’re stuck.", why: "We began with forms and preset assets; GenAI lifted the library limit and kept the guidance.", fit: "wide", shots: [["Describe a world", "/img/dreamin-world.webp"]] },
      { when: "During", step: "Add characters and story", pain: "How do the pieces fit together?", k: "Step by step:", fix: "world, then characters, then story; each result stays on screen behind the next question.", fit: "wide", shots: [["Who lives here?", "/img/dreamin-characters.webp"]] },
      { when: "After", step: "Play", pain: "I still can’t code a game.", k: "Instantly playable:", fix: "the engine builds it in one of four formats, ready to play and share in 1–3 minutes.", why: "Mystery, 2D platform, 2D fighting or card game: what 2022 models could support.", fit: "wide", shots: [["Play and talk to characters", "/img/dreamin-play.webp"]] }
    ],
    extras: []
  },
  p4: {
    lede: "Play the Shan Hai Jing (Classic of Mountains and Seas) instead of reading it.",
    facts: [["What", "Unity game: roguelike Minesweeper + restoration sim"], ["For", "Players curious about Chinese mythology"], ["Role", "Art · UI/UX"], ["Team", "Jessica W. (Unity) · Tana Y. (music, story)"],
      ["Outcome", "<b>Playable demo on itch.io</b> · MVP playtested in 3 Discord groups."]],
    cover: { cls: "bleed", shots: [["The restored scroll world", "/img/sh-world.webp"]] },
    pain: "China’s richest myth collection is hard to get into.",
    painNote: "Scattered fragments, hundreds of creatures, classical text.",
    sol: [
      { when: "Before", step: "Arrive in a faded world", pain: "Where do I begin?", k: "Start small:", fix: "one courtyard, one goal: bring the world back.", fit: "wide", shots: [["The empty scroll", "/img/sh-scene-empty.webp"], ["The first courtyard", "/img/sh-start.webp"]] },
      { when: "During", step: "Explore the unknown", pain: "Myths shouldn’t feel like homework.", k: "Myth as play:", fix: "familiar Minesweeper, plus chests, hazards and myth events.", why: "Playtests turned plain traps into myth events.", fit: "wide", shots: [["An expedition", "/img/sh-expedition.webp"], ["The playtested web MVP", "/img/sh-mvp.webp"]] },
      { when: "After", step: "Rebuild, summon a guardian", pain: "Why does what I collect matter?", k: "Visible progress:", fix: "every haul rebuilds and levels up the scroll until its guardian returns.", fit: "wide", shots: [["Halfway restored", "/img/sh-midway.webp"], ["Upgrading a farmhouse", "/img/sh-upgrade.webp"]] }
    ],
    extras: [
      { step: "UI system", note: "Scroll panels, seal-stamp building tags and hex tiles, hand-drawn to match the ink-wash world.", view: { kind: "rows", cap: "UI guide · building tags · tiles",
        rows: [[["/img/sh-uiguide.webp", "UI guide: scroll panels, buttons, colours"]], [["/img/sh-tags.webp", "Seal-stamp building tags"]],
          [["/img/sh-starttile.webp", "Start tile"], ["/img/sh-treasuretile.webp", "Treasure tile"], ["/img/sh-hazardtile.webp", "Hazard tile"], ["/img/sh-eventtile.webp", "Mythic event tile"], ["/img/sh-exittile.webp", "Exit tile"]]] } },
      { step: "Characters and buildings", note: "Every character, building and prop, drawn by me.", view: { kind: "cut", cap: "Characters and buildings",
        items: [["/img/sh-qingniao.webp", "Qing Niao, companion"], ["/img/sh-oldman.webp", "The old guide"], ["/img/sh-pagoda.webp", "Temple"], ["/img/sh-courtyard.webp", "Courtyard"], ["/img/sh-workshop.webp", "Workshop"], ["/img/sh-farmhouse.webp", "Farmhouse"],
          ["/img/sh-storage.webp", "Storage"], ["/img/sh-mountain.webp", "Mountain entrance"], ["/img/sh-moneytree.webp", "Money tree"], ["/img/sh-shrine.webp", "Broken shrine"], ["/img/sh-field.webp", "Field"], ["/img/sh-tree.webp", "Ginkgo"]] } }
    ]
  }
};
